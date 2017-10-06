/*
 * Acts as a proxy for communication between background page and page worker.
 * Receives messages from flashproxy.js and passes it to background page.
 */

function receiveMessage(event)
{
  self.postMessage(event.data);
}

window.addEventListener("message", receiveMessage, false);