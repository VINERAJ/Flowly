import React, { useEffect, useState } from 'react';
import logo from '@assets/img/logo.svg';
import '@pages/newtab/Newtab.css';
import { Link,Route, Routes } from 'react-router-dom';
import Timer from '../timer/Timer';

export default function Newtab() {
  localStorage.setItem("workTime", new Date(Date.now() + 5 * 60 * 1000).toString());
  const [points, setPoints] = useState(0);
  const [remainingTime, setRemainingTime] = useState<string>("");

  useEffect(() => {
    // Set workTime using chrome.storage.local if not already set
    chrome.storage.local.get({ workTime: null }, (result) => {
      if (!result.workTime) {
        const newWorkTime = new Date(Date.now() + 5 * 60 * 1000).toString();
        chrome.storage.local.set({ workTime: newWorkTime });
      }
    });

    // Update points when opening a new tab
    chrome.storage.local.get({ points: 0 }, (result) => {
      const currentPoints = result.points + 50; // Add 50 points
      chrome.storage.local.set({ points: currentPoints }, () => {
        setPoints(currentPoints);
      });
    });

    // Timer logic: Calculate remaining time
    const timerInterval = setInterval(() => {
      chrome.storage.local.get({ workTime: null }, (result) => {
        if (result.workTime) {
          const workTime = new Date(result.workTime).getTime();
          const currentTime = Date.now();
          const timeLeft = workTime - currentTime;

          if (timeLeft > 0) {
            const minutes = Math.floor(timeLeft / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            setRemainingTime(`${minutes}m ${seconds}s`);
          } else {
            setRemainingTime("Time's up!");
            clearInterval(timerInterval); // Stop the timer when time is up
          }
        }
      });
    }, 1000);

    return () => clearInterval(timerInterval); // Cleanup interval on component unmount
  }, []);
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          You have <strong>{points}</strong> points.
        </p>
        <p>
          Remaining work time: <strong>{remainingTime}</strong>
        </p>
        <p>
          Edit <code>src/pages/newtab/Newtab.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!
        </a>
      </header>
    </div>
  );
}