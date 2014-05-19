/**
 * @fileoverview Get CBI flag color and display on toolbar.
 * @author sligocki@gmail.com (Shawn Ligocki)
 */

var clickUrl = "http://www.community-boating.org/about-us/weather-information/";
var pollUrl = "https://portal2.community-boating.org/pls/apex/CBI_PROD.FLAG_JS";

var greenFlag = { name: "Green", icon: "images/green.png",
                  message: "It's a Green flag day. Low winds." };
var yellowFlag = { name: "Yellow", icon: "images/yellow.png",
                   message: "It's a Yellow flag day. Moderate winds." };
var redFlag = { name: "Red", icon: "images/red.png",
                message: "It's a Red flag day. High winds." };
var closedFlag = { name: "Closed", icon: "images/closed.png",
                   message: "Community Boating is closed." };
function errorFlag(contents) {
    return { name: "Error", icon: "images/error.png",
             message: "Error reading " + pollUrl + " content: " + contents };
}

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
  request.open("GET", pollUrl, false);
  request.send();  // Blocking request

  // Parse current flag status.
  var flag;
  if (request.status === 200) {
    var flagPattern = /var FLAG_COLOR = "(.)";/g;
    var result = flagPattern.exec(request.responseText);
    if (!result) {
      result = flagPattern.exec(request.responseText);
    }
    if (result) {
      var color = result[1];
      switch (color) {
        case "G":
          flag = greenFlag;
          break;
        case "Y":
          flag = yellowFlag;
          break;
        case "R":
          flag = redFlag;
          break;
        case "C":
          flag = closedFlag;
          break;
        default:
          flag = errorFlag(request.responseText);
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
  chrome.tabs.create({ url: clickUrl });
});
