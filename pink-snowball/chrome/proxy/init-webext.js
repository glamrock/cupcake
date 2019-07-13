/* global Util, chrome, Config, WebExtUI, Broker, Snowflake */
/* eslint no-unused-vars: 0 */

/*
Entry point.
*/

var debug, snowflake, config, broker, ui, log, dbg, init, update, silenceNotifications;

(function () {

  silenceNotifications = false;
  debug = false;
  snowflake = null;
  config = null;
  broker = null;
  ui = null;

  // Log to both console and UI if applicable.
  // Requires that the snowflake and UI objects are hooked up in order to
  // log to console.
  log = function(msg) {
    console.log('Snowflake: ' + msg);
    return snowflake != null ? snowflake.ui.log(msg) : void 0;
  };

  dbg = function(msg) {
    if (debug) {
      return log(msg);
    }
  };

  if (!Util.featureDetect()) {
    chrome.runtime.onConnect.addListener(function(port) {
      return port.postMessage({
        missingFeature: true
      });
    });
    return;
  }

  init = function() {
    config = new Config;
    ui = new WebExtUI();
    broker = new Broker(config.brokerUrl);
    snowflake = new Snowflake(config, ui, broker);
    log('== snowflake proxy ==');
    return ui.initToggle();
  };

  update = function() {
    if (!ui.enabled) {
      // Do not activate the proxy if any number of conditions are true.
      snowflake.disable();
      log('Currently not active.');
      return;
    }
    // Otherwise, begin setting up WebRTC and acting as a proxy.
    dbg('Contacting Broker at ' + broker.url);
    log('Starting snowflake');
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
