import logo from '@assets/img/logo.svg';

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
          const newPoints = points - 2;
          chrome.storage.local.set({ points: newPoints }, () => {
            console.log("Subtracted three points, new total:", newPoints);

            // Show a notification to the user
            // chrome.notifications.create({
            //   type: 'basic',
            //   iconUrl: '@assets/img/logo.svg', // Replace with the path to your extension's icon
            //   title: 'Points Deducted',
            //   message: 'You lost 3 points! Mark this tab as productive to avoid losing points.',
            // });
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

// Add 1 point every 2 minutes if the timer is running
setInterval(() => {
  chrome.storage.local.get(['workTime', 'points'], (result) => {
    const workTime = result.workTime;

    if (workTime) {
      const workTimeMs = new Date(workTime).getTime();
      const currentTime = Date.now();
      const timeLeft = workTimeMs - currentTime;

      if (timeLeft > 0) {
        const points = parseInt(result.points || '0', 10);
        const newPoints = points + 1;
        chrome.storage.local.set({ points: newPoints }, () => {
          console.log("Added one point, new total:", newPoints);
        });
      } else {
        console.log("Timer expired. No points added.");
      }
    } else {
      console.log("No timer set. No points added.");
    }
  });
}, 2 * 60 * 1000); // Runs every 2 minutes