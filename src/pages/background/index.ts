console.log('background script loaded');

// Set workTime using chrome.storage.local
// chrome.storage.local.set({ workTime: new Date(Date.now() + 5 * 60 * 1000).toString() });

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.local.get(['productiveTabs', 'workTime', 'points'], (result) => {
    const productiveTabs = JSON.parse(result.productiveTabs || '{}');
    const workTime = result.workTime;

    if (productiveTabs[activeInfo.tabId]) {
      console.log("Productive tab activated.");
    } else {
      console.log("Unproductive tab activated.");

      // Check if the timer is running
      if (workTime) {
        const workTimeMs = new Date(workTime).getTime();
        const currentTime = Date.now();
        const timeLeft = workTimeMs - currentTime;

        if (timeLeft > 0) {
          const points = parseInt(result.points || '0', 10);
          const newPoints = points - 3;
          chrome.storage.local.set({ points: newPoints }, () => {
            console.log("Subtracted three points, new total:", newPoints);
          });
        } else {
          console.log("Timer is not running. No points deducted.");
        }
      } else {
        console.log("No timer set. No points deducted.");
      }
    }

    chrome.tabs.get(activeInfo.tabId, (tab) => {
      console.log("Now active tab URL is:", tab.url);
    });
  });
});