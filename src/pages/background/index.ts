console.log('background script loaded');

localStorage.setItem("workTime", new Date(Date.now() + 5 * 60 * 1000).toString());

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.local.get({ productiveTabs: {} }, (result) => {
    const productiveTabs = result.productiveTabs;
    if (productiveTabs[activeInfo.tabId]) {
      console.log("Productive tab activated.");
    } else {
      console.log("Unproductive tab activated.");
      chrome.storage.local.get({ points: 0 }, (res) => {
        const newPoints = res.points - 3;
        chrome.storage.local.set({ points: newPoints }, () => {
          console.log("Subtracted 3 points, new total:", newPoints);
        });
      });
    }
  });

  chrome.tabs.get(activeInfo.tabId, (tab) => {
    console.log("Now active tab URL is:", tab.url);
  });
});
