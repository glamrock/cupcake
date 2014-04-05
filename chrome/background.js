var fp = new FlashProxy();

fp.on_proxy_start = function() {
    chrome.browserAction.setIcon({ "path": "images/active_icon2.png"});
};

fp.on_proxy_end = function() {
    // return to default icon
    chrome.browserAction.setIcon({ "path": "images/cupcake48.png"});
};

fp.on_disable = function() {
    chrome.browserAction.setIcon({ "path": "images/disabled_icon2.png"});
};

fp.on_die = function() {
    chrome.browserAction.setIcon({ "path": "images/cupcake48.png"});
};

if (flashproxy_should_disable())
    fp.disable();

fp.start();
