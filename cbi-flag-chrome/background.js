/**
 * @fileoverview Description of this file.
 * @author sligocki@google.com (Shawn Ligocki)
 */

var greenFlag = { name: "Green", icon: "green.png",
                  message: "It's a Green flag day. Low winds." };
var yellowFlag = { name: "Yellow", icon: "yellow.png",
                   message: "It's a Yellow flag day. Moderate winds." };
var redFlag = { name: "Red", icon: "red.png",
                message: "It's a Red flag day. High winds." };
var closedFlag = { name: "Closed", icon: "closed.png",
                   message: "Community Boating is closed." };
var errorFlag = { name: "Error", icon: "error.png",
    message: "Error reading http://www.community-boating.org/weather" };

var lastFlag = 0;

function updateFlag() {
  // Request Community Boating page.
  var request = new XMLHttpRequest();
  request.open("GET", "http://www.community-boating.org/cbi-weather", false);
  request.send();  // Blocking request

  // Parse current flag status.
  var flag = errorFlag;
  if (request.status === 200) {
    var flagPattern = /Current Flag is: .*(Green|Yellow|Red|Closed)/g;
    var color = flagPattern.exec(request.responseText)[1];
    switch (color) {
      case "Green":
        flag = greenFlag;
        break;
      case "Yellow":
        flag = yellowFlag;
        break;
      case "Red":
        flag = redFlag;
        break;
      case "Closed":
        flag = closedFlag;
        break;
    }
  }
  // Set flag to appropriate icon.
  chrome.browserAction.setIcon({path: flag.icon});

  // Send notification.
  if (flag !== lastFlag) {
    var notification = webkitNotifications.createNotification(
        flag.icon, flag.name, flag.message);
    notification.show();
    lastFlag = flag;
  }
}

// Update flag once every minute.
updateFlag();
setInterval(updateFlag, 60 * 1000);

// Go to CBI website on click.
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({ url: "http://www.community-boating.org/weather" });
});
