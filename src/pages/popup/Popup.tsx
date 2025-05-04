import React, { useState, useEffect } from 'react';
import logo from '@assets/img/logo.png';

chrome.storage.local.set({isProductive: true});

export default function Popup() {
  const [remainingTime, setRemainingTime] = useState<string>("");
  // Timer logic remains using localStorage for now
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const workTime = localStorage.getItem('workTime');
      if (workTime) {
        const workTimeMs = new Date(workTime).getTime();
        const currentTime = Date.now();
        const timeLeft = workTimeMs - currentTime;

        if (timeLeft > 0) {
          const minutes = Math.floor(timeLeft / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setRemainingTime(`${minutes}m ${seconds}s`);
        } else {
          setRemainingTime("Time's up!");
          clearInterval(timerInterval);
        }
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  // Mark the current tab as productive.
  // Now uses chrome.storage.local so background knows not to subtract points for this tab.
  const markProductive = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.storage.local.get(['productiveTabs', 'points'], (result) => {
          const productiveTabs = JSON.parse(result.productiveTabs || '{}');
          productiveTabs[tab.id] = true;
          chrome.storage.local.set({ productiveTabs: JSON.stringify(productiveTabs) }, () => {
            // Optionally, give the user three bonus points (if intended)
            const points = parseInt(result.points || '0', 10);
            const newPoints = points + 3;
            chrome.storage.local.set({ points: newPoints }, () => {
              console.log(`Tab ${tab.id} marked as productive. Points updated to ${newPoints}`);
            });
          });
        });
      }
    });
  };

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <header className="flex flex-col items-center justify-center text-white">
        <img
          src={logo}
          className="w-full h-36 object-contain"
          alt="logo"
        />
        <p>
          Remaining work time: <strong>{remainingTime}</strong>
        </p>
        <button
          onClick={markProductive}
          className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
        >
          Mark Tab Productive
        </button>
      </header>
    </div>
  );
}