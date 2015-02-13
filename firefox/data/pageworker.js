
var fp = new FlashProxy();

fp.on_proxy_start = function() {
  self.postMessage("proxy_started");
};

fp.on_proxy_end = function() {
  self.postMessage("proxy_ended");
};

fp.on_disable = function() {
  self.postMessage("proxy_disabled");
};

fp.on_die = function() {
  self.postMessage("proxy_died");
};

if (flashproxy_should_disable())
{
  fp.disable();
}

fp.start();
