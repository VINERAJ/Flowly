import logo from '@assets/img/logo.svg';

console.log('background script loaded');

// Initialize isProductive to true if not set
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('isProductive', (result) => {
    if (result.isProductive === undefined) {
      chrome.storage.local.set({ isProductive: true, points: 0 });
      console.log('Initialized isProductive to true and points to 0');
    }
  });
  // Also clear any potentially lingering timers on install/update
  chrome.storage.local.remove(['workTime', 'breakTime']);
});


chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.storage.local.get(['productiveTabs', 'workTime', 'points', 'isProductive'], (result) => {
    // Only deduct points if in productivity mode
    if (!result.isProductive) {
      console.log("Break mode active. No points deducted for unproductive tabs.");
      return; // Don't proceed further if in break mode
    }

    const productiveTabs = JSON.parse(result.productiveTabs || '{}');
    const workTime = result.workTime;

    if (productiveTabs[activeInfo.tabId]) {
      console.log("Productive tab activated.");
    } else {
      console.log("Unproductive tab activated.");

      // Check if the productivity timer is running
      if (workTime) {
        const workTimeMs = new Date(workTime).getTime();
        const currentTime = Date.now();
        const timeLeft = workTimeMs - currentTime;

        if (timeLeft > 0) {
          const points = parseInt(result.points || '0', 10);
          // Ensure points don't go below zero
          const newPoints = Math.max(0, points - 2);
          chrome.storage.local.set({ points: newPoints }, () => {
            console.log("Subtracted two points, new total:", newPoints);
            // Optional: Add notification logic back if desired
          });
        } else {
          // This case should ideally be handled by the interval timer setting isProductive to false
          console.log("Timer is not running (or expired). No points deducted.");
        }
      } else {
        console.log("No timer set. No points deducted.");
      }
    }

    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        return;
      }
      if (tab) {
        console.log("Now active tab URL is:", tab.url);
      }
    });
  });
});

// Check timer status frequently for accurate mode switching
setInterval(() => {
  chrome.storage.local.get(['workTime', 'breakTime', 'points', 'isProductive'], (result) => {
    const workTime = result.workTime;
    const breakTime = result.breakTime;
    const isProductive = result.isProductive;
    const points = parseInt(result.points || '0', 10);
    const currentTime = Date.now();

    let timerIsRunning = false;
    let timerExpired = false;
    let stateChanged = false; // Flag to track if mode switched in this check

    if (isProductive && workTime) {
      const workTimeMs = new Date(workTime).getTime();
      const timeLeft = workTimeMs - currentTime;
      if (timeLeft > 0) {
        timerIsRunning = true;
      } else {
        // Productivity timer expired, switch to break mode
        timerExpired = true;
        stateChanged = true;
        chrome.storage.local.set({ isProductive: false, workTime: null }, () => {
          console.log("Productivity timer expired. Switched to break mode.");
          // Optionally trigger a notification about break time starting
        });
      }
    } else if (!isProductive && breakTime) {
        const breakTimeMs = new Date(breakTime).getTime();
        const timeLeft = breakTimeMs - currentTime;
        if (timeLeft > 0) {
            timerIsRunning = true;
        } else {
            // Break timer expired, switch back to productivity mode (or idle state)
            timerExpired = true;
            stateChanged = true;
            chrome.storage.local.set({ isProductive: true, breakTime: null }, () => {
                console.log("Break timer expired. Switched to productivity mode.");
                 // Optionally trigger a notification about break time ending
            });
        }
    } else if (!workTime && !breakTime) {
        // No timers are running.
        // If we are currently in break mode (isProductive is false), stay there (waiting for break timer start).
        // If we are in productive mode (initial state or after break), stay there.
        // No state change needed in this condition based solely on lack of timers.
        console.log("No timers running. Current mode:", isProductive ? "Productive" : "Break");
        timerIsRunning = false;
        // Removed the automatic switch back to productive mode here
    }

    // Logging for state changes or stability
    if (!timerIsRunning && !timerExpired && !stateChanged) {
      // Only log if no timer is running AND a timer didn't just expire/state didn't change in *this* check
       console.log("No timer running and state stable.");
    } else if (timerIsRunning) {
        console.log("Timer is running.");
    }
    // Note: Point awarding is handled by the separate 2-minute interval below
  });
}, 5 * 1000); // Check every 5 seconds for responsiveness


// Separate interval for awarding points (keeps original 2-minute frequency)
setInterval(() => {
    chrome.storage.local.get(['workTime', 'breakTime', 'points', 'isProductive'], (result) => {
        const workTime = result.workTime;
        const breakTime = result.breakTime;
        const isProductive = result.isProductive;
        const points = parseInt(result.points || '0', 10);
        const currentTime = Date.now();

        let timerIsActive = false;

        if (isProductive && workTime) {
            const workTimeMs = new Date(workTime).getTime();
            if (workTimeMs > currentTime) {
                timerIsActive = true;
            }
        } else if (!isProductive && breakTime) {
            const breakTimeMs = new Date(breakTime).getTime();
             if (breakTimeMs > currentTime) {
                timerIsActive = true;
            }
        }

        if (timerIsActive) {
            const newPoints = points + 1;
            chrome.storage.local.set({ points: newPoints }, () => {
                console.log("Awarded one point (2 min interval), new total:", newPoints);
            });
        } else {
             console.log("No active timer for point award (2 min interval).");
        }
    });
}, 2 * 60 * 1000); // Award points every 2 minutes