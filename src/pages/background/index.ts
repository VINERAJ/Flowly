console.log('background script loaded');

chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("Tab changed to ID:", activeInfo.tabId);

  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log("Now active tab URL is:", tab.url);
  });
});