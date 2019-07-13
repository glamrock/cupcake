/* global Config, UI, Broker, Snowflake */

/*
Entry point.
*/

var config = new Config;

var ui = new UI();

var broker = new Broker(config.brokerUrl);

var snowflake = new Snowflake(config, ui, broker);

var log = function(msg) {
  return console.log('Snowflake: ' + msg);
};

var dbg = log;

log('== snowflake proxy ==');

dbg('Contacting Broker at ' + broker.url);

snowflake.setRelayAddr(config.relayAddr);

snowflake.beginWebRTC();
