import React, { useState, useEffect } from 'react';
import logo from '@assets/img/logo.png';

// Helper function (can be moved to a shared utils file)
function formatTime(ms: number): string {
  if (ms <= 0) return "0m 0s";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default function Popup() {
  const [points, setPoints] = useState(0);
  const [isProductive, setIsProductive] = useState<boolean | null>(null); // null initially for loading state
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [timerRunning, setTimerRunning] = useState(false); // Tracks if *any* timer is running

  // Effect to sync state from storage
  useEffect(() => {
    const syncState = () => {
      chrome.storage.local.get(['isProductive', 'points', 'workTime', 'breakTime'], (result) => {
        const productive = result.isProductive ?? true; // Default to productive
        const currentPoints = parseInt(result.points || '0', 10);
        const workTime = result.workTime;
        const breakTime = result.breakTime;

        setIsProductive(productive);
        setPoints(currentPoints);

        const currentTime = Date.now();
        let running = false;
        let timeLeftMs = 0;

        if (productive && workTime) {
          const workTimeMs = new Date(workTime).getTime();
          timeLeftMs = workTimeMs - currentTime;
          running = timeLeftMs > 0;
        } else if (!productive && breakTime) {
          const breakTimeMs = new Date(breakTime).getTime();
          timeLeftMs = breakTimeMs - currentTime;
          running = timeLeftMs > 0;
        }

        setTimerRunning(running);
        setRemainingTime(running ? formatTime(timeLeftMs) : (productive ? "No work timer set" : "No break timer set"));

      });
    };

    syncState(); // Initial sync

    // Listen for storage changes
     const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && (changes.isProductive || changes.points || changes.workTime || changes.breakTime)) {
        console.log("Storage changed, syncing Popup state:", changes);
        syncState();
      }
    };
    chrome.storage.onChanged.addListener(listener);

    // Set up an interval to update the displayed time
    const intervalId = setInterval(syncState, 1000); // Re-sync every second to update time

    return () => {
        chrome.storage.onChanged.removeListener(listener);
        clearInterval(intervalId);
    }
  }, []); // Run only once on mount

  // Mark Productive Button Logic (Only relevant in Productivity mode)
  const markProductive = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
       if (chrome.runtime.lastError || !tabs || tabs.length === 0) {
         console.error("Error querying tabs:", chrome.runtime.lastError?.message || "No active tab found");
         return;
       }
      const tab = tabs[0];
      if (tab.id) {
        chrome.storage.local.get(['productiveTabs', 'points'], (result) => {
          const productiveTabs = JSON.parse(result.productiveTabs || '{}');
          productiveTabs[tab.id] = true;
          const currentPoints = parseInt(result.points || '0', 10);
          // Give 3 bonus points for marking productive
          const newPoints = currentPoints + 3;
          chrome.storage.local.set({
              productiveTabs: JSON.stringify(productiveTabs),
              points: newPoints
            }, () => {
            console.log(`Tab ${tab.id} marked as productive. Points updated to ${newPoints}`);
            // Optionally force a state refresh if needed, though listener should catch it
            // syncState(); // Example: Manually trigger refresh if listener is slow
          });
        });
      }
    });
  };


  // --- Render Logic ---

  if (isProductive === null) {
    return <div className="w-64 text-white text-center p-4 bg-gray-800">Loading...</div>; // Added width
  }

  // Common Header
  const renderHeader = () => (
     <header className="flex flex-col items-center justify-center text-white mb-3">
        <img
          src={logo}
          className="w-24 h-24 object-contain mb-2" // Adjusted size
          alt="logo"
        />
         <p>
          You have <strong>{points}</strong> points.
        </p>
      </header>
  );

  // Productivity Mode UI
  if (isProductive) {
    return (
      <div className="w-64 text-center p-3 bg-gray-800"> {/* Darker background for productive */}
        {renderHeader()}
        <p className="mb-3">
          {timerRunning ? `Remaining work time: ` : ''}
          <strong>{remainingTime}</strong>
        </p>
        {/* Only show Mark Productive if a timer is actually running */}
        {timerRunning && (
            <button
            onClick={markProductive}
            className="mt-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white text-sm"
            >
            Mark This Tab Productive (+3 Pts)
            </button>
        )}
         {!timerRunning && (
             <p className="text-xs text-gray-400 mt-2">Start a timer from a new tab.</p>
         )}
      </div>
    );
  }
  // Break Mode UI
  else {
     const encouragement = ["Enjoy your break!", "Rest up!", "Recharge!", "You earned it!"];
     const randomEncouragement = encouragement[Math.floor(Math.random() * encouragement.length)];

    return (
      <div className="w-64 text-center p-3 bg-blue-200 text-gray-900"> {/* Lighter background for break */}
         {renderHeader()} {/* Still show logo and points */}
         <p className="mb-2 text-lg font-semibold">Break Time!</p>
        <p className="mb-3">
          {timerRunning ? `Remaining break time: ` : ''}
          <strong>{remainingTime}</strong>
        </p>
        <p className="italic text-sm">{randomEncouragement}</p>
         {!timerRunning && (
             <p className="text-xs text-gray-600 mt-2">Start a break timer from a new tab.</p>
         )}
      </div>
    );
  }
}