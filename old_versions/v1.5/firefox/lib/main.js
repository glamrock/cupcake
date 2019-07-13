var { ActionButton } = require("sdk/ui/button/action");
var panels = require("sdk/panel");
var self = require("sdk/self");
var pageWorkers = require("sdk/page-worker");


var panel = panels.Panel({
  contentURL: self.data.url("menu.html"),
  width: 370,
  height: 600
});

// Add popup button
var button = ActionButton({
  id: "my-button",
  label: "my button",
  icon: {
    "16": "./images/cupcake24.png",
    "32": "./images/cupcake32.png",
    "64": "./images/cupcake128.png"
  },
  onClick: onActionBtnClicked
});

function onActionBtnClicked(state) {
  // show popup on click
  panel.show({
    position: button
  });
}


// Start a page worker to run flash proxy in. Flash proxy cannot run in current page because it does not
// have any window object
pageWorkers.Page({
  contentURL: self.data.url("flashproxy.html"),
  contentScriptFile: [self.data.url("commProxy.js")],
  contentScriptWhen: "start",
  onMessage: function(message) {
    console.log("Message received: " + message);
    switch(message) {
      case "proxy_started":
        button.icon = "./images/active_icon.png";
        break;
      case "proxy_ended":
        button.icon = "./images/cupcake48.png";
        break;
      case "proxy_disabled":
        button.icon = "./images/grey_icon.png";
        break;
      case "proxy_died":
        button.icon = "./images/cupcake48.png";
        break;
    }
  }
});
