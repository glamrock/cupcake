main();

function main() {
    var fp = new FlashProxy();
    fp.on_proxy_start = on_proxy_start;
    fp.on_proxy_end = on_proxy_end;
    fp.on_disable = on_disable;
    fp.on_die = on_die;
    fp.start();

    function on_proxy_start() {
        chrome.browserAction.setIcon({ "path": "images/active_icon.png"});
    }

    function on_proxy_end() {
        // return to default icon
        chrome.browserAction.setIcon({ "path": "images/cupcake48.png"});
    }

    function on_disable() {
        chrome.browserAction.setIcon({ "path": "images/disabled_icon.png"});
    }

    function on_die() {
        chrome.browserAction.setIcon({ "path": "images/dead_icon.png"});
    }
}