import React, { useEffect, useState } from 'react';
import logo from '@assets/img/logo.png';
import '@pages/newtab/Newtab.css';

export default function Newtab() {
  const [points, setPoints] = useState(0);
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [selectedMinutes, setSelectedMinutes] = useState(20);
  const [timerRunning, setTimerRunning] = useState(false);

  // Mark the tab as productive when the component mounts
  useEffect(() => {
    chrome.storage.local.set({ isProductiveTab: true });
  }, []);

  // Fetch points every second for a live update
  useEffect(() => {
    const pointsInterval = setInterval(() => {
      chrome.storage.local.get(['points'], (result) => {
        const storedPoints = parseInt(result.points || '0', 10);
        setPoints(storedPoints);
      });
    }, 1000);
    return () => clearInterval(pointsInterval);
  }, []);

  // Start the timer with the given minutes
  const startTimer = () => {
    if (!timerRunning) {
      const newWorkTime = new Date(Date.now() + selectedMinutes * 60 * 1000).toString();
      chrome.storage.local.set({ workTime: newWorkTime });
      setTimerRunning(true);
    }
  };

  useEffect(() => {
    const updateTitle = () => {
      if (remainingTime) {
        document.title = `${remainingTime}`;
      } else {
        document.title = "New Tab";
      }
    };
  
    updateTitle(); // Update the title initially
  
    const timerInterval = setInterval(() => {
      chrome.storage.local.get(['workTime'], (result) => {
        const workTime = result.workTime;
        if (workTime) {
          const workTimeMs = new Date(workTime).getTime();
          const currentTime = Date.now();
          const timeLeft = workTimeMs - currentTime;
          localStorage.setItem('workTime', workTime);
  
          if (timeLeft > 0) {
            const minutes = Math.floor(timeLeft / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            setRemainingTime(`${minutes}m ${seconds}s`);
            setTimerRunning(true);
          } else {
            setRemainingTime("Time's up!");
            setTimerRunning(false);
            chrome.storage.local.remove('workTime');
            clearInterval(timerInterval);
          }
        } else {
          setRemainingTime("");
          setTimerRunning(false);
        }
        updateTitle(); // Update the title whenever the timer updates
      });
    }, 1000);
  
    return () => {
      clearInterval(timerInterval);
      document.title = "New Tab"; // Reset the title when the component unmounts
    };
  }, [remainingTime]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          You have <strong>{points}</strong> points.
        </p>
        <p>
          Remaining work time: <strong>{remainingTime || "Not started"}</strong>
        </p>
        {!timerRunning && (
          <div className="mt-4">
            <label htmlFor="timerSelect" className="mr-2 text-white">
              Select Timer Duration:
            </label>
            <select
              id="timerSelect"
              value={selectedMinutes}
              onChange={(e) => setSelectedMinutes(parseInt(e.target.value, 10))}
              className="px-2 py-1 rounded"
              disabled={timerRunning}
            >
              {
                Array.from({ length: 41 }, (_, i) => i + 1).map(min => (
                  <option key={min} value={min}>{min} minutes</option>
                ))
              }
            </select>
            <button
              onClick={startTimer}
              className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded"
              disabled={timerRunning}
            >
              Start Timer
            </button>
          </div>
        )}
        {timerRunning && (
          <p className="mt-4 text-white">
            Timer is running. You cannot edit the timer until it finishes.
          </p>
        )}
        <p className="mt-4">
        </p>
      </header>
    </div>
  );
}