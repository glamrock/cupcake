/* global log, dbg, snowflake */

/*
Communication with the snowflake broker.

Browser snowflakes must register with the broker in order
to get assigned to clients.
*/

// Represents a broker running remotely.
class Broker {

  // When interacting with the Broker, snowflake must generate a unique session
  // ID so the Broker can keep track of each proxy's signalling channels.
  // On construction, this Broker object does not do anything until
  // |getClientOffer| is called.
  constructor(url) {
    // Promises some client SDP Offer.
    // Registers this Snowflake with the broker using an HTTP POST request, and
    // waits for a response containing some client offer that the Broker chooses
    // for this proxy..
    // TODO: Actually support multiple clients.
    this.getClientOffer = this.getClientOffer.bind(this);
    // urlSuffix for the broker is different depending on what action
    // is desired.
    this._postRequest = this._postRequest.bind(this);
    this.url = url;
    this.clients = 0;
    if (0 === this.url.indexOf('localhost', 0)) {
      // Ensure url has the right protocol + trailing slash.
      this.url = 'http://' + this.url;
    }
    if (0 !== this.url.indexOf('http', 0)) {
      this.url = 'https://' + this.url;
    }
    if ('/' !== this.url.substr(-1)) {
      this.url += '/';
    }
  }

  getClientOffer(id) {
    return new Promise((fulfill, reject) => {
      var xhr;
      xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.DONE !== xhr.readyState) {
          return;
        }
        switch (xhr.status) {
          case Broker.STATUS.OK:
            return fulfill(xhr.responseText); // Should contain offer.
          case Broker.STATUS.GATEWAY_TIMEOUT:
            return reject(Broker.MESSAGE.TIMEOUT);
          default:
            log('Broker ERROR: Unexpected ' + xhr.status + ' - ' + xhr.statusText);
            snowflake.ui.setStatus(' failure. Please refresh.');
            return reject(Broker.MESSAGE.UNEXPECTED);
        }
      };
      this._xhr = xhr; // Used by spec to fake async Broker interaction
      return this._postRequest(id, xhr, 'proxy', id);
    });
  }

  // Assumes getClientOffer happened, and a WebRTC SDP answer has been generated.
  // Sends it back to the broker, which passes it to back to the original client.
  sendAnswer(id, answer) {
    var xhr;
    dbg(id + ' - Sending answer back to broker...\n');
    dbg(answer.sdp);
    xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.DONE !== xhr.readyState) {
        return;
      }
      switch (xhr.status) {
        case Broker.STATUS.OK:
          dbg('Broker: Successfully replied with answer.');
          return dbg(xhr.responseText);
        case Broker.STATUS.GONE:
          return dbg('Broker: No longer valid to reply with answer.');
        default:
          dbg('Broker ERROR: Unexpected ' + xhr.status + ' - ' + xhr.statusText);
          return snowflake.ui.setStatus(' failure. Please refresh.');
      }
    };
    return this._postRequest(id, xhr, 'answer', JSON.stringify(answer));
  }

  _postRequest(id, xhr, urlSuffix, payload) {
    var err;
    try {
      xhr.open('POST', this.url + urlSuffix);
      xhr.setRequestHeader('X-Session-ID', id);
    } catch (error) {
      err = error;
      /*
      An exception happens here when, for example, NoScript allows the domain
      on which the proxy badge runs, but not the domain to which it's trying
      to make the HTTP xhr. The exception message is like "Component
      returned failure code: 0x805e0006 [nsIXMLHttpRequest.open]" on Firefox.
      */
      log('Broker: exception while connecting: ' + err.message);
      return;
    }
    return xhr.send(payload);
  }

}

Broker.STATUS = {
  OK: 200,
  GONE: 410,
  GATEWAY_TIMEOUT: 504
};

Broker.MESSAGE = {
  TIMEOUT: 'Timed out waiting for a client offer.',
  UNEXPECTED: 'Unexpected status.'
};

Broker.prototype.clients = 0;

class Config {}

Config.prototype.brokerUrl = 'snowflake-broker.bamsoftware.com';

Config.prototype.relayAddr = {
  host: 'snowflake.bamsoftware.com',
  port: '443'
};

// Original non-wss relay:
// host: '192.81.135.242'
// port: 9902
Config.prototype.cookieName = "snowflake-allow";

// Bytes per second. Set to undefined to disable limit.
Config.prototype.rateLimitBytes = void 0;

Config.prototype.minRateLimit = 10 * 1024;

Config.prototype.rateLimitHistory = 5.0;

Config.prototype.defaultBrokerPollInterval = 5.0 * 1000;

Config.prototype.maxNumClients = 1;

Config.prototype.connectionsPerClient = 1;

// TODO: Different ICE servers.
Config.prototype.pcConfig = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302']
    }
  ]
};
/* global snowflake, log, dbg, Util, PeerConnection, Snowflake, Parse, WS */

/*
Represents a single:

   client <-- webrtc --> snowflake <-- websocket --> relay

Every ProxyPair has a Snowflake ID, which is necessary when responding to the
Broker with an WebRTC answer.
*/

class ProxyPair {

  /*
  Constructs a ProxyPair where:
  - @relayAddr is the destination relay
  - @rateLimit specifies a rate limit on traffic
  */
  constructor(relayAddr, rateLimit, pcConfig) {
    // Given a WebRTC DataChannel, prepare callbacks.
    this.prepareDataChannel = this.prepareDataChannel.bind(this);
    // Assumes WebRTC datachannel is connected.
    this.connectRelay = this.connectRelay.bind(this);
    // WebRTC --> websocket
    this.onClientToRelayMessage = this.onClientToRelayMessage.bind(this);
    // websocket --> WebRTC
    this.onRelayToClientMessage = this.onRelayToClientMessage.bind(this);
    this.onError = this.onError.bind(this);
    // Send as much data in both directions as the rate limit currently allows.
    this.flush = this.flush.bind(this);
    this.relayAddr = relayAddr;
    this.rateLimit = rateLimit;
    this.pcConfig = pcConfig;
    this.id = Util.genSnowflakeID();
    this.c2rSchedule = [];
    this.r2cSchedule = [];
  }

  // Prepare a WebRTC PeerConnection and await for an SDP offer.
  begin() {
    this.pc = new PeerConnection(this.pcConfig, {
      optional: [
        {
          DtlsSrtpKeyAgreement: true
        },
        {
          RtpDataChannels: false
        }
      ]
    });
    this.pc.onicecandidate = (evt) => {
      // Browser sends a null candidate once the ICE gathering completes.
      if (null === evt.candidate) {
        // TODO: Use a promise.all to tell Snowflake about all offers at once,
        // once multiple proxypairs are supported.
        dbg('Finished gathering ICE candidates.');
        return snowflake.broker.sendAnswer(this.id, this.pc.localDescription);
      }
    };
    // OnDataChannel triggered remotely from the client when connection succeeds.
    return this.pc.ondatachannel = (dc) => {
      var channel;
      channel = dc.channel;
      dbg('Data Channel established...');
      this.prepareDataChannel(channel);
      return this.client = channel;
    };
  }

  receiveWebRTCOffer(offer) {
    if ('offer' !== offer.type) {
      log('Invalid SDP received -- was not an offer.');
      return false;
    }
    try {
      this.pc.setRemoteDescription(offer);
    } catch (error) {
      log('Invalid SDP message.');
      return false;
    }
    dbg('SDP ' + offer.type + ' successfully received.');
    return true;
  }

  prepareDataChannel(channel) {
    channel.onopen = () => {
      log('WebRTC DataChannel opened!');
      snowflake.state = Snowflake.MODE.WEBRTC_READY;
      snowflake.ui.setActive(true);
      // This is the point when the WebRTC datachannel is done, so the next step
      // is to establish websocket to the server.
      return this.connectRelay();
    };
    channel.onclose = () => {
      log('WebRTC DataChannel closed.');
      snowflake.ui.setStatus('disconnected by webrtc.');
      snowflake.ui.setActive(false);
      snowflake.state = Snowflake.MODE.INIT;
      this.flush();
      return this.close();
    };
    channel.onerror = function() {
      return log('Data channel error!');
    };
    channel.binaryType = "arraybuffer";
    return channel.onmessage = this.onClientToRelayMessage;
  }

  connectRelay() {
    var params, peer_ip, ref;
    dbg('Connecting to relay...');
    // Get a remote IP address from the PeerConnection, if possible. Add it to
    // the WebSocket URL's query string if available.
    // MDN marks remoteDescription as "experimental". However the other two
    // options, currentRemoteDescription and pendingRemoteDescription, which
    // are not marked experimental, were undefined when I tried them in Firefox
    // 52.2.0.
    // https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/remoteDescription
    peer_ip = Parse.ipFromSDP((ref = this.pc.remoteDescription) != null ? ref.sdp : void 0);
    params = [];
    if (peer_ip != null) {
      params.push(["client_ip", peer_ip]);
    }
    var relay = this.relay = WS.makeWebsocket(this.relayAddr, params);
    this.relay.label = 'websocket-relay';
    this.relay.onopen = () => {
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = 0;
      }
      log(relay.label + ' connected!');
      return snowflake.ui.setStatus('connected');
    };
    this.relay.onclose = () => {
      log(relay.label + ' closed.');
      snowflake.ui.setStatus('disconnected.');
      snowflake.ui.setActive(false);
      snowflake.state = Snowflake.MODE.INIT;
      this.flush();
      return this.close();
    };
    this.relay.onerror = this.onError;
    this.relay.onmessage = this.onRelayToClientMessage;
    // TODO: Better websocket timeout handling.
    return this.timer = setTimeout((() => {
      if (0 === this.timer) {
        return;
      }
      log(relay.label + ' timed out connecting.');
      return relay.onclose();
    }), 5000);
  }

  onClientToRelayMessage(msg) {
    dbg('WebRTC --> websocket data: ' + msg.data.byteLength + ' bytes');
    this.c2rSchedule.push(msg.data);
    return this.flush();
  }

  onRelayToClientMessage(event) {
    dbg('websocket --> WebRTC data: ' + event.data.byteLength + ' bytes');
    this.r2cSchedule.push(event.data);
    return this.flush();
  }

  onError(event) {
    var ws;
    ws = event.target;
    log(ws.label + ' error.');
    return this.close();
  }

  // Close both WebRTC and websocket.
  close() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = 0;
    }
    this.running = false;
    if (this.webrtcIsReady()) {
      this.client.close();
    }
    this.client = null;
    if (this.relayIsReady()) {
      this.relay.close();
    }
    this.relay = null;
    this.onCleanup();
  }

  flush() {
    var busy, checkChunks;
    if (this.flush_timeout_id) {
      clearTimeout(this.flush_timeout_id);
    }
    this.flush_timeout_id = null;
    busy = true;
    checkChunks = () => {
      var chunk;
      busy = false;
      // WebRTC --> websocket
      if (this.relayIsReady() && this.relay.bufferedAmount < this.MAX_BUFFER && this.c2rSchedule.length > 0) {
        chunk = this.c2rSchedule.shift();
        this.rateLimit.update(chunk.byteLength);
        this.relay.send(chunk);
        busy = true;
      }
      // websocket --> WebRTC
      if (this.webrtcIsReady() && this.client.bufferedAmount < this.MAX_BUFFER && this.r2cSchedule.length > 0) {
        chunk = this.r2cSchedule.shift();
        this.rateLimit.update(chunk.byteLength);
        this.client.send(chunk);
        return busy = true;
      }
    };
    while (busy && !this.rateLimit.isLimited()) {
      checkChunks();
    }
    if (this.r2cSchedule.length > 0 || this.c2rSchedule.length > 0 || (this.relayIsReady() && this.relay.bufferedAmount > 0) || (this.webrtcIsReady() && this.client.bufferedAmount > 0)) {
      return this.flush_timeout_id = setTimeout(this.flush, this.rateLimit.when() * 1000);
    }
  }

  webrtcIsReady() {
    return null !== this.client && 'open' === this.client.readyState;
  }

  relayIsReady() {
    return (null !== this.relay) && (WebSocket.OPEN === this.relay.readyState);
  }

  isClosed(ws) {
    return void 0 === ws || WebSocket.CLOSED === ws.readyState;
  }

}

ProxyPair.prototype.MAX_BUFFER = 10 * 1024 * 1024;

ProxyPair.prototype.pc = null;

ProxyPair.prototype.client = null; // WebRTC Data channel

ProxyPair.prototype.relay = null; // websocket

ProxyPair.prototype.timer = 0;

ProxyPair.prototype.running = true;

ProxyPair.prototype.active = false; // Whether serving a client.

ProxyPair.prototype.flush_timeout_id = null;

ProxyPair.prototype.onCleanup = null;

ProxyPair.prototype.id = null;
/* global log, dbg, DummyRateLimit, BucketRateLimit, SessionDescription, ProxyPair */

/*
A JavaScript WebRTC snowflake proxy

Uses WebRTC from the client, and Websocket to the server.

Assume that the webrtc client plugin is always the offerer, in which case
this proxy must always act as the answerer.

TODO: More documentation
*/

// Minimum viable snowflake for now - just 1 client.
class Snowflake {

  // Prepare the Snowflake with a Broker (to find clients) and optional UI.
  constructor(config, ui, broker) {
    // Receive an SDP offer from some client assigned by the Broker,
    // |pair| - an available ProxyPair.
    this.receiveOffer = this.receiveOffer.bind(this);
    this.config = config;
    this.ui = ui;
    this.broker = broker;
    this.state = Snowflake.MODE.INIT;
    this.proxyPairs = [];
    if (void 0 === this.config.rateLimitBytes) {
      this.rateLimit = new DummyRateLimit();
    } else {
      this.rateLimit = new BucketRateLimit(this.config.rateLimitBytes * this.config.rateLimitHistory, this.config.rateLimitHistory);
    }
    this.retries = 0;
  }

  // Set the target relay address spec, which is expected to be websocket.
  // TODO: Should potentially fetch the target from broker later, or modify
  // entirely for the Tor-independent version.
  setRelayAddr(relayAddr) {
    this.relayAddr = relayAddr;
    log('Using ' + relayAddr.host + ':' + relayAddr.port + ' as Relay.');
    return true;
  }

  // Initialize WebRTC PeerConnection, which requires beginning the signalling
  // process. |pollBroker| automatically arranges signalling.
  beginWebRTC() {
    this.state = Snowflake.MODE.WEBRTC_CONNECTING;
    log('ProxyPair Slots: ' + this.proxyPairs.length);
    log('Snowflake IDs: ' + (this.proxyPairs.map(function(p) {
      return p.id;
    })).join(' | '));
    this.pollBroker();
    return this.pollInterval = setInterval((() => {
      return this.pollBroker();
    }), this.config.defaultBrokerPollInterval);
  }

  // Regularly poll Broker for clients to serve until this snowflake is
  // serving at capacity, at which point stop polling.
  pollBroker() {
    var msg, pair, recv;
    // Poll broker for clients.
    pair = this.nextAvailableProxyPair();
    if (!pair) {
      log('At client capacity.');
      return;
    }
    // Do nothing until a new proxyPair is available.
    pair.active = true;
    msg = 'Polling for client ... ';
    if (this.retries > 0) {
      msg += '[retries: ' + this.retries + ']';
    }
    this.ui.setStatus(msg);
    recv = this.broker.getClientOffer(pair.id);
    recv.then((desc) => {
      if (pair.running) {
        if (!this.receiveOffer(pair, desc)) {
          return pair.active = false;
        }
      } else {
        return pair.active = false;
      }
    }, function() {
      return pair.active = false;
    });
    return this.retries++;
  }

  // Returns the first ProxyPair that's available to connect.
  nextAvailableProxyPair() {
    if (this.proxyPairs.length < this.config.connectionsPerClient) {
      return this.makeProxyPair(this.relayAddr);
    }
    return this.proxyPairs.find(function(pp) {
      return !pp.active;
    });
  }

  receiveOffer(pair, desc) {
    var e, offer, sdp;
    try {
      offer = JSON.parse(desc);
      dbg('Received:\n\n' + offer.sdp + '\n');
      sdp = new SessionDescription(offer);
      if (pair.receiveWebRTCOffer(sdp)) {
        this.sendAnswer(pair);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      e = error;
      log('ERROR: Unable to receive Offer: ' + e);
      return false;
    }
  }

  sendAnswer(pair) {
    var fail, next;
    next = function(sdp) {
      dbg('webrtc: Answer ready.');
      return pair.pc.setLocalDescription(sdp);
    };
    fail = function() {
      return dbg('webrtc: Failed to create Answer');
    };
    return pair.pc.createAnswer().then(next).catch(fail);
  }

  makeProxyPair(relay) {
    var pair;
    pair = new ProxyPair(relay, this.rateLimit, this.config.pcConfig);
    this.proxyPairs.push(pair);
    pair.onCleanup = () => {
      var ind;
      // Delete from the list of active proxy pairs.
      ind = this.proxyPairs.indexOf(pair);
      if (ind > -1) {
        return this.proxyPairs.splice(ind, 1);
      }
    };
    pair.begin();
    return pair;
  }

  // Stop all proxypairs.
  disable() {
    var results;
    log('Disabling Snowflake.');
    clearInterval(this.pollInterval);
    results = [];
    while (this.proxyPairs.length > 0) {
      results.push(this.proxyPairs.pop().close());
    }
    return results;
  }

}

Snowflake.prototype.relayAddr = null;

Snowflake.prototype.rateLimit = null;

Snowflake.prototype.pollInterval = null;

Snowflake.prototype.retries = 0;

// Janky state machine
Snowflake.MODE = {
  INIT: 0,
  WEBRTC_CONNECTING: 1,
  WEBRTC_READY: 2
};

Snowflake.MESSAGE = {
  CONFIRMATION: 'You\'re currently serving a Tor user via Snowflake.'
};
/* global chrome, log, update */

/*
All of Snowflake's DOM manipulation and inputs.
*/

class UI {

  setStatus() {}

  setActive(connected) {
    return this.active = connected;
  }

  log() {}

}

UI.prototype.active = false;

UI.prototype.enabled = true;


class BadgeUI extends UI {

  constructor() {
    super();
    this.$badge = document.getElementById('badge');
  }

  setActive(connected) {
    super.setActive(connected);
    return this.$badge.className = connected ? 'active' : '';
  }

}

BadgeUI.prototype.$badge = null;


class DebugUI extends UI {

  constructor() {
    super();
    // Setup other DOM handlers if it's debug mode.
    this.$status = document.getElementById('status');
    this.$msglog = document.getElementById('msglog');
    this.$msglog.value = '';
  }

  // Status bar
  setStatus(msg) {
    var txt;
    txt = document.createTextNode('Status: ' + msg);
    while (this.$status.firstChild) {
      this.$status.removeChild(this.$status.firstChild);
    }
    return this.$status.appendChild(txt);
  }

  setActive(connected) {
    super.setActive(connected);
    return this.$msglog.className = connected ? 'active' : '';
  }

  log(msg) {
    // Scroll to latest
    this.$msglog.value += msg + '\n';
    return this.$msglog.scrollTop = this.$msglog.scrollHeight;
  }

}

// DOM elements references.
DebugUI.prototype.$msglog = null;

DebugUI.prototype.$status = null;


class WebExtUI extends UI {

  constructor() {
    super();
    this.onConnect = this.onConnect.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
    this.initStats();
    chrome.runtime.onConnect.addListener(this.onConnect);
  }

  initStats() {
    this.stats = [0];
    return setInterval((() => {
      this.stats.unshift(0);
      this.stats.splice(24);
      return this.postActive();
    }), 60 * 60 * 1000);
  }

  initToggle() {
    chrome.storage.local.get("snowflake-enabled", (result) => {
      if (result['snowflake-enabled'] !== void 0) {
        this.enabled = result['snowflake-enabled'];
      } else {
        log("Toggle state not yet saved");
      }
      this.setEnabled(this.enabled);
    });
  }

  postActive() {
    var ref;
    return (ref = this.port) != null ? ref.postMessage({
      active: this.active,
      total: this.stats.reduce((function(t, c) {
        return t + c;
      }), 0),
      enabled: this.enabled
    }) : void 0;
  }

  onConnect(port) {
    this.port = port;
    port.onDisconnect.addListener(this.onDisconnect);
    port.onMessage.addListener(this.onMessage);
    return this.postActive();
  }

  onMessage(m) {
    this.enabled = m.enabled;
    this.setEnabled(this.enabled);
    this.postActive();
    chrome.storage.local.set({
      "snowflake-enabled": this.enabled
    }, function() {
      log("Stored toggle state");
    });
  }

  onDisconnect() {
    this.port = null;
  }

  setActive(connected) {
    super.setActive(connected);
    if (connected) {
      this.stats[0] += 1;
    }
    this.postActive();
    if (this.active) {
      return chrome.browserAction.setIcon({
        path: {
          32: "icons/status-running.png"
        }
      });
    } else {
      return chrome.browserAction.setIcon({
        path: {
          32: "icons/status-on.png"
        }
      });
    }
  }

  setEnabled(enabled) {
    update();
    return chrome.browserAction.setIcon({
      path: {
        32: "icons/status-" + (enabled ? "on" : "off") + ".png"
      }
    });
  }

}

WebExtUI.prototype.port = null;

WebExtUI.prototype.stats = null;
/* global log */
/* exported Params, DummyRateLimit */

/*
A JavaScript WebRTC snowflake proxy

Contains helpers for parsing query strings and other utilities.
*/

class Util {

/*  static mightBeTBB() {
    return Util.TBB_UAS.indexOf(window.navigator.userAgent) > -1 && (window.navigator.mimeTypes && window.navigator.mimeTypes.length === 0);
  }*/

  static genSnowflakeID() {
    return Math.random().toString(36).substring(2);
  }

static snowflakeIsDisabled(cookieName) {
    var cookies;
    cookies = Parse.cookie(document.cookie);
    // Do nothing if snowflake has not been opted in by user.
    return false;
  }

  static featureDetect() {
    return typeof PeerConnection === 'function';
  }

}

// It would not be effective for Tor Browser users to run the proxy.
// Do we seem to be running in Tor Browser? Check the user-agent string and for
// no listing of supported MIME types.
Util.TBB_UAS = [
  'redacted'
];


class Parse {

  // Parse a cookie data string (usually document.cookie). The return type is an
  // object mapping cookies names to values. Returns null on error.
  // http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-8747038
/*  static cookie(cookies) {
    var i, j, len, name, result, string, strings, value;
    result = {};
    strings = [];
    if (cookies) {
      strings = cookies.split(';');
    }
    for (i = 0, len = strings.length; i < len; i++) {
      string = strings[i];
      j = string.indexOf('=');
      if (-1 === j) {
        return null;
      }
      name = decodeURIComponent(string.substr(0, j).trim());
      value = decodeURIComponent(string.substr(j + 1).trim());
      if (!(name in result)) {
        result[name] = value;
      }
    }
    return result;
  }*/

  // Parse an address in the form 'host:port'. Returns an Object with keys 'host'
  // (String) and 'port' (int). Returns null on error.
  static address(spec) {
    var host, m, port;
    m = null;
    if (!m) {
      // IPv6 syntax.
      m = spec.match(/^\[([\0-9a-fA-F:.]+)\]:([0-9]+)$/);
    }
    if (!m) {
      // IPv4 syntax.
      m = spec.match(/^([0-9.]+):([0-9]+)$/);
    }
    if (!m) {
      // TODO: Domain match
      return null;
    }
    host = m[1];
    port = parseInt(m[2], 10);
    if (isNaN(port) || port < 0 || port > 65535) {
      return null;
    }
    return {
      host: host,
      port: port
    };
  }

  // Parse a count of bytes. A suffix of 'k', 'm', or 'g' (or uppercase)
  // does what you would think. Returns null on error.
  static byteCount(spec) {
    let matches = spec.match(/^(\d+(?:\.\d*)?)(\w*)$/);
    if (matches === null) {
      return null;
    }
    let count = Number(matches[1]);
    if (isNaN(count)) {
      return null;
    }
    const UNITS = new Map([
      ['', 1],
      ['k', 1024],
      ['m', 1024*1024],
      ['g', 1024*1024*1024],
    ]);
    let unit = matches[2].toLowerCase();
    if (!UNITS.has(unit)) {
      return null;
    }
    let multiplier = UNITS.get(unit);
    return count * multiplier;
  }

  // Parse a connection-address out of the "c=" Connection Data field of a
  // session description. Return undefined if none is found.
  // https://tools.ietf.org/html/rfc4566#section-5.7
  static ipFromSDP(sdp) {
    var i, len, m, pattern, ref;
    ref = [/^c=IN IP4 ([\d.]+)(?:(?:\/\d+)?\/\d+)?(:? |$)/m, /^c=IN IP6 ([0-9A-Fa-f:.]+)(?:\/\d+)?(:? |$)/m];
    for (i = 0, len = ref.length; i < len; i++) {
      pattern = ref[i];
      m = pattern.exec(sdp);
      if (m != null) {
        return m[1];
      }
    }
  }

}


class Params {

  static getBool(query, param, defaultValue) {
    if (!query.has(param)) {
      return defaultValue;
    }
    var val;
    val = query.get(param);
    if ('true' === val || '1' === val || '' === val) {
      return true;
    }
    if ('false' === val || '0' === val) {
      return false;
    }
    return null;
  }

  // Get an object value and parse it as a byte count. Example byte counts are
  // '100' and '1.3m'. Returns |defaultValue| if param is not a key. Return null
  // on a parsing error.
  static getByteCount(query, param, defaultValue) {
    if (!query.has(param)) {
      return defaultValue;
    }
    return Parse.byteCount(query.get(param));
  }

}


class BucketRateLimit {

  constructor(capacity, time) {
    this.capacity = capacity;
    this.time = time;
  }

  age() {
    var delta, now;
    now = new Date();
    delta = (now - this.lastUpdate) / 1000.0;
    this.lastUpdate = now;
    this.amount -= delta * this.capacity / this.time;
    if (this.amount < 0.0) {
      return this.amount = 0.0;
    }
  }

  update(n) {
    this.age();
    this.amount += n;
    return this.amount <= this.capacity;
  }

  // How many seconds in the future will the limit expire?
  when() {
    this.age();
    return (this.amount - this.capacity) / (this.capacity / this.time);
  }

  isLimited() {
    this.age();
    return this.amount > this.capacity;
  }

}

BucketRateLimit.prototype.amount = 0.0;

BucketRateLimit.prototype.lastUpdate = new Date();


// A rate limiter that never limits.
class DummyRateLimit {

  constructor(capacity, time) {
    this.capacity = capacity;
    this.time = time;
  }

  update() {
    return true;
  }

  when() {
    return 0.0;
  }

  isLimited() {
    return false;
  }

}
/*
Only websocket-specific stuff.
*/

class WS {

  // Build an escaped URL string from unescaped components. Only scheme and host
  // are required. See RFC 3986, section 3.
  static buildUrl(scheme, host, port, path, params) {
    var parts;
    parts = [];
    parts.push(encodeURIComponent(scheme));
    parts.push('://');
    // If it contains a colon but no square brackets, treat it as IPv6.
    if (host.match(/:/) && !host.match(/[[\]]/)) {
      parts.push('[');
      parts.push(host);
      parts.push(']');
    } else {
      parts.push(encodeURIComponent(host));
    }
    if (void 0 !== port && this.DEFAULT_PORTS[scheme] !== port) {
      parts.push(':');
      parts.push(encodeURIComponent(port.toString()));
    }
    if (void 0 !== path && '' !== path) {
      if (!path.match(/^\//)) {
        path = '/' + path;
      }
      path = path.replace(/[^/]+/, function(m) {
        return encodeURIComponent(m);
      });
      parts.push(path);
    }
    if (void 0 !== params) {
      parts.push('?');
      parts.push(new URLSearchParams(params).toString());
    }
    return parts.join('');
  }

  static makeWebsocket(addr, params) {
    var url, ws, wsProtocol;
    wsProtocol = this.WSS_ENABLED ? 'wss' : 'ws';
    url = this.buildUrl(wsProtocol, addr.host, addr.port, '/', params);
    ws = new WebSocket(url);
    /*
    'User agents can use this as a hint for how to handle incoming binary data:
    if the attribute is set to 'blob', it is safe to spool it to disk, and if it
    is set to 'arraybuffer', it is likely more efficient to keep the data in
    memory.'
    */
    ws.binaryType = 'arraybuffer';
    return ws;
  }

}

WS.WSS_ENABLED = true;

WS.DEFAULT_PORTS = {
  http: 80,
  https: 443
};
/* global module, require */

/*
WebRTC shims for multiple browsers.
*/

if (typeof module !== "undefined" && module !== null ? module.exports : void 0) {
  window = {};
  document = {
    getElementById: function() {
      return null;
    }
  };
  chrome = {};
  location = { search: '' };
  ({ URLSearchParams } = require('url'));
  if ((typeof TESTING === "undefined" || TESTING === null) || !TESTING) {
    webrtc = require('wrtc');
    PeerConnection = webrtc.RTCPeerConnection;
    IceCandidate = webrtc.RTCIceCandidate;
    SessionDescription = webrtc.RTCSessionDescription;
    WebSocket = require('ws');
    ({ XMLHttpRequest } = require('xmlhttprequest'));
  }
} else {
  PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
  SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
  WebSocket = window.WebSocket;
  XMLHttpRequest = window.XMLHttpRequest;
}
/* global TESTING, Util, Params, Config, DebugUI, BadgeUI, UI, Broker, Snowflake */

/*
Entry point.
*/

var snowflake, query, debug, silenceNotifications, log, dbg, init;

(function() {

  if (((typeof TESTING === "undefined" || TESTING === null) || !TESTING) && !Util.featureDetect()) {
    console.log('webrtc feature not detected. shutting down');
    return;
  }

  snowflake = null;

  query = new URLSearchParams(location.search);

  debug = Params.getBool(query, 'debug', false);

  silenceNotifications = Params.getBool(query, 'silent', false);

  // Log to both console and UI if applicable.
  // Requires that the snowflake and UI objects are hooked up in order to
  // log to console.
  log = function(msg) {
    console.log('Snowflake: ' + msg);
    return snowflake != null ? snowflake.ui.log(msg) : void 0;
  };

  dbg = function(msg) {
    if (debug || ((snowflake != null ? snowflake.ui : void 0) instanceof DebugUI)) {
      return log(msg);
    }
  };

  init = function() {
    var broker, config, ui;
    config = new Config;
    if ('off' !== query.get('ratelimit')) {
      config.rateLimitBytes = Params.getByteCount(query, 'ratelimit', config.rateLimitBytes);
    }
    ui = null;
    if (document.getElementById('badge') !== null) {
      ui = new BadgeUI();
    } else if (document.getElementById('status') !== null) {
      ui = new DebugUI();
    } else {
      ui = new UI();
    }
    broker = new Broker(config.brokerUrl);
    snowflake = new Snowflake(config, ui, broker);
    log('== snowflake proxy ==');
/*    if (Util.snowflakeIsDisabled(config.cookieName)) {
      // Do not activate the proxy if any number of conditions are true.
      log('Currently not active.');
      return;
    }*/
    // Otherwise, begin setting up WebRTC and acting as a proxy.
    dbg('Contacting Broker at ' + broker.url);
    snowflake.setRelayAddr(config.relayAddr);
    return snowflake.beginWebRTC();
  };

  // Notification of closing tab with active proxy.
  window.onbeforeunload = function() {
    if (
      !silenceNotifications &&
      snowflake !== null &&
      Snowflake.MODE.WEBRTC_READY === snowflake.state
    ) {
      return Snowflake.MESSAGE.CONFIRMATION;
    }
    return null;
  };

  window.onunload = function() {
    if (snowflake !== null) { snowflake.disable(); }
    return null;
  };

  window.onload = init;

}());
