import React, { useState, useEffect, useMemo } from 'react';
import logo from '@assets/img/logo.svg';

const SECOND = 1000;
const MINUTE = SECOND * 60;

export default function Popup({ deadline = new Date().toString() }) {
  const markProductive = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.id) {
        chrome.storage.local.get({ productiveTabs: {} }, (result) => {
          const productiveTabs = result.productiveTabs;
          productiveTabs[tab.id] = true;
          chrome.storage.local.set({ productiveTabs }, () => {
            console.log(`Tab ${tab.id} marked as productive`);
            // Add 3 points since the tab is being marked as productive.
            chrome.storage.local.get({ points: 0 }, (res) => {
              const newPoints = res.points + 3;
              chrome.storage.local.set({ points: newPoints }, () => {
                console.log("Added 3 points, new total:", newPoints);
              });
            });
          });
        });
      }
    });
  };
  if (deadline=="") {
    return (
      <div className="timer">
            <h1>
              Enter time on main screen to start
            </h1>
        </div>
    );
  }
  const parsedDeadline = useMemo(() => Date.parse(deadline), [deadline]);
  const [time, setTime] = useState(parsedDeadline - Date.now());
  useEffect(() => {
    const interval = setInterval(
        () => setTime(parsedDeadline - Date.now()),
        1000,
    );

    return () => clearInterval(interval);
}, []);
  return (
    <div className="timer">
            {Object.entries({
                //Hours: 24,
                Minutes: (time/MINUTE) % 60,
                Seconds: (time / SECOND) % 60,
            }).map(([label, value]) => (
                <div key={label} className="col-4">
                    <div className="box">
                        <p>{`${Math.floor(value)}`.padStart(2, "0")}</p>
                        <span className="text">{label}</span>
                    </div>
                </div>
            ))}
      <header>
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