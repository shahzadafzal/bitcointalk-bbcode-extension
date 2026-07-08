// background.js
chrome.commands.onCommand.addListener(function (command) {
  const actionMap = {
    "toggle-bold": "bold",
    "toggle-italic": "italic",
    "size-up": "size-up",
    "size-down": "size-down"
  };

  const action = actionMap[command];
  if (!action) return;

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const activeTabId = tabs[0] && tabs[0].id;
    if (!activeTabId) return;

    chrome.tabs.sendMessage(activeTabId, { type: "bbcode-action", action }, function () {
      if (chrome.runtime.lastError) {
        console.warn("Unable to send BBCode action", chrome.runtime.lastError.message);
      }
    });
  });
});

