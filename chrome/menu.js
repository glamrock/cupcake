window.onload = main;

function main() {
    var bp = chrome.extension.getBackgroundPage();
    document.getElementById("badge-container").appendChild(bp.fp.badge_elem);
}