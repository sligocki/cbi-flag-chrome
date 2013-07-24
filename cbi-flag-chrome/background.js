/**
 * @fileoverview Description of this file.
 * @author sligocki@google.com (Shawn Ligocki)
 */

var weatherUrl = "https://portal.community-boating.org/apex/f?p=710:1:0:::::";

var greenFlag = { name: "Green", icon: "green.png",
                  message: "It's a Green flag day. Low winds." };
var yellowFlag = { name: "Yellow", icon: "yellow.png",
                   message: "It's a Yellow flag day. Moderate winds." };
var redFlag = { name: "Red", icon: "red.png",
                message: "It's a Red flag day. High winds." };
var closedFlag = { name: "Closed", icon: "closed.png",
                   message: "Community Boating is closed." };
var errorFlag = { name: "Error", icon: "error.png",
    message: "Error reading " + weatherUrl };

var lastFlag = 0;

// Get current time string in format: 12/13 12:45
function getCurrentTime() {
  var now = new Date()
	var month = now.getMonth() + 1
	var day = now.getDate()
	var hour = now.getHours()
	var minute = now.getMinutes()
	// Give leading zero to minute
	if (minute < 10) {
	  minute = "0" + minute
	}

	return month + "/" + day + " " + hour + ":" + minute
}

function updateFlag() {
  // Request Community Boating page.
  var request = new XMLHttpRequest();
  request.open("GET", weatherUrl, false);
  request.send();  // Blocking request

  // Parse current flag status.
  var flag = errorFlag;
  if (request.status === 200) {
    var flagPattern = /Current Flag is: .*(Green|Yellow|Red|Closed)/g;
    var result = flagPattern.exec(request.responseText);
    if (!result) {
      result = flagPattern.exec(request.responseText);
    }
    if (result) {
      var color = result[1];
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
  }
  // Set flag to appropriate icon.
  chrome.browserAction.setIcon({path: flag.icon});

  // Send notification.
  if (flag !== lastFlag) {
    var notification = webkitNotifications.createNotification(
        flag.icon, flag.name + " " + getCurrentTime(), flag.message);
    notification.show();
    lastFlag = flag;
  }
}

// Update flag once every minute.
updateFlag();
setInterval(updateFlag, 60 * 1000);

// Go to CBI website on click.
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({ url: weatherUrl });
});
