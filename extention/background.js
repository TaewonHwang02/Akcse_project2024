chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'unmuteTab') {
    
    chrome.tabs.update(sender.tab.id, { muted: false });
  }
});
