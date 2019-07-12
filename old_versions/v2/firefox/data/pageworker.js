
var fp = new FlashProxy();

fp.on_proxy_start = function() {
  window.postMessage("proxy_started", "*");
};

fp.on_proxy_end = function() {
  window.postMessage("proxy_ended", "*");
};

fp.on_disable = function() {
  window.postMessage("proxy_disabled", "*");
};

fp.on_die = function() {
  window.postMessage("proxy_died", "*");
};

if (flashproxy_should_disable())
{
  fp.disable();
}

fp.start();
