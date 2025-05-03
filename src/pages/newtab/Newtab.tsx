import React, { useEffect, useState } from 'react';
import logo from '@assets/img/logo.png';
import '@pages/newtab/Newtab.css';

export default function Newtab() {
  const [points, setPoints] = useState(0);
  const [remainingTime, setRemainingTime] = useState<string>("");
  const [selectedMinutes, setSelectedMinutes] = useState(20);
  const [timerRunning, setTimerRunning] = useState(false);

  // Start the timer with the given minutes
  const startTimer = () => {
    if (!timerRunning) {
      const newWorkTime = new Date(Date.now() + selectedMinutes * 60 * 1000).toString();
      chrome.storage.local.set({ workTime: newWorkTime });
      setTimerRunning(true);
    }
  };

  useEffect(() => {
    // Update points when opening a new tab
    chrome.storage.local.get(['points', 'workTime'], (result) => {
      const currentPoints = parseInt(result.points || '0', 10);
      setPoints(currentPoints);

      const workTime = result.workTime;
      if (workTime) {
        const workTimeMs = new Date(workTime).getTime();
        const currentTime = Date.now();
        const timeLeft = workTimeMs - currentTime;

        if (timeLeft > 0) {
          setTimerRunning(true);
        } else {
          setTimerRunning(false);
        }
      }
    });

    const timerInterval = setInterval(() => {
      chrome.storage.local.get(['workTime'], (result) => {
        const workTime = result.workTime;
        if (workTime) {
          const workTimeMs = new Date(workTime).getTime();
          const currentTime = Date.now();
          const timeLeft = workTimeMs - currentTime;

          if (timeLeft > 0) {
            const minutes = Math.floor(timeLeft / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            setRemainingTime(`${minutes}m ${seconds}s`);
            setTimerRunning(true);
          } else {
            setRemainingTime("Time's up!");
            setTimerRunning(false);
            // Remove workTime after finished
            chrome.storage.local.remove('workTime');
            clearInterval(timerInterval);
          }
        } else {
          // When no timer is active, clear remaining time
          setRemainingTime("");
          setTimerRunning(false);
        }
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

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
                Array.from({ length: 41 }, (_, i) => i + 20).map(min => (
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
          Edit <code>src/pages/newtab/Newtab.tsx</code> and save to reload.
        </p>
      </header>
    </div>
  );
}