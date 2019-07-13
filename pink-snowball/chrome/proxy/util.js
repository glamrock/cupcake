/* global log */
/* exported Query, Params, DummyRateLimit */

/*
A JavaScript WebRTC snowflake proxy

Contains helpers for parsing query strings and other utilities.
*/

class Util {

  static mightBeTBB() {
    return Util.TBB_UAS.indexOf(window.navigator.userAgent) > -1 && (window.navigator.mimeTypes && window.navigator.mimeTypes.length === 0);
  }

  static genSnowflakeID() {
    return Math.random().toString(36).substring(2);
  }

  static snowflakeIsDisabled(cookieName) {
    var cookies;
    cookies = Parse.cookie(document.cookie);
    // Do nothing if snowflake has not been opted in by user.
    if (cookies[cookieName] !== '1') {
      log('Not opted-in. Please click the badge to change options.');
      return true;
    }
    // Also do nothing if running in Tor Browser.
    if (Util.mightBeTBB()) {
      log('Will not run within Tor Browser.');
      return true;
    }
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
  'Mozilla/5.0 (Windows NT 6.1; rv:10.0) Gecko/20100101 Firefox/10.0',
  'Mozilla/5.0 (Windows NT 6.1; rv:17.0) Gecko/20100101 Firefox/17.0',
  'Mozilla/5.0 (Windows NT 6.1; rv:24.0) Gecko/20100101 Firefox/24.0',
  'Mozilla/5.0 (Windows NT 6.1; rv:31.0) Gecko/20100101 Firefox/31.0'
];


class Query {

  /*
  Parse a URL query string or application/x-www-form-urlencoded body. The
  return type is an object mapping string keys to string values. By design,
  this function doesn't support multiple values for the same named parameter,
  for example 'a=1&a=2&a=3'; the first definition always wins. Returns null on
  error.

  Always decodes from UTF-8, not any other encoding.
  http://dev.w3.org/html5/spec/Overview.html#url-encoded-form-data
  */
  static parse(qs) {
    var i, j, len, name, result, string, strings, value;
    result = {};
    strings = [];
    if (qs) {
      strings = qs.split('&');
    }
    if (0 === strings.length) {
      return result;
    }
    for (i = 0, len = strings.length; i < len; i++) {
      string = strings[i];
      j = string.indexOf('=');
      if (j === -1) {
        name = string;
        value = '';
      } else {
        name = string.substr(0, j);
        value = string.substr(j + 1);
      }
      name = decodeURIComponent(name.replace(/\+/g, ' '));
      value = decodeURIComponent(value.replace(/\+/g, ' '));
      if (!(name in result)) {
        result[name] = value;
      }
    }
    return result;
  }

  // params is a list of (key, value) 2-tuples.
  static buildString(params) {
    var i, len, param, parts;
    parts = [];
    for (i = 0, len = params.length; i < len; i++) {
      param = params[i];
      parts.push(encodeURIComponent(param[0]) + '=' + encodeURIComponent(param[1]));
    }
    return parts.join('&');
  }

}


class Parse {

  // Parse a cookie data string (usually document.cookie). The return type is an
  // object mapping cookies names to values. Returns null on error.
  // http://www.w3.org/TR/DOM-Level-2-HTML/html.html#ID-8747038
  static cookie(cookies) {
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
  }

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
    var UNITS, count, matches, units;
    UNITS = {
      k: 1024,
      m: 1024 * 1024,
      g: 1024 * 1024 * 1024,
      K: 1024,
      M: 1024 * 1024,
      G: 1024 * 1024 * 1024
    };
    matches = spec.match(/^(\d+(?:\.\d*)?)(\w*)$/);
    if (null === matches) {
      return null;
    }
    count = Number(matches[1]);
    if (isNaN(count)) {
      return null;
    }
    if ('' === matches[2]) {
      units = 1;
    } else {
      units = UNITS[matches[2]];
      if (null === units) {
        return null;
      }
    }
    return count * Number(units);
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
    var val;
    val = query[param];
    if (void 0 === val) {
      return defaultValue;
    }
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
    var spec;
    spec = query[param];
    if (void 0 === spec) {
      return defaultValue;
    }
    return Parse.byteCount(spec);
  }

  // Get an object value and parse it as an address spec. Returns |defaultValue|
  // if param is not a key. Returns null on a parsing error.
  static getAddress(query, param, defaultValue) {
    var val;
    val = query[param];
    if (void 0 === val) {
      return defaultValue;
    }
    return Parse.address(val);
  }

  // Get an object value and return it as a string. Returns default_val if param
  // is not a key.
  static getString(query, param, defaultValue) {
    var val;
    val = query[param];
    if (void 0 === val) {
      return defaultValue;
    }
    return val;
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
