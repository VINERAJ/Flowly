import React, { useEffect, useState } from 'react';
import logo from '@assets/img/logo.svg';
import '@pages/newtab/Newtab.css';
import { Link,Route, Routes } from 'react-router-dom';
import Timer from '../timer/Timer';

export default function Newtab() {
  localStorage.setItem("workTime", new Date(Date.now() + 5 * 60 * 1000).toString());
  const [points, setPoints] = useState(0);

  useEffect(() => {
    chrome.storage.local.get({ points: 0 }, (result) => {
      const currentPoints = result.points + 50; // Add 50 when opening a new tab.
      chrome.storage.local.set({ points: currentPoints }, () => {
        setPoints(currentPoints);
      });
    });
  }, []);
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          You have <strong>{points}</strong> points.
        </p>
        <p>
          Edit <code>src/pages/newtab/Newtab.tsx</code> and save to reload.
        </p>
        {/* <Link to='/timer'>
            View Full Menu
        </Link>
        <Routes>
          <Route path="/timer">
            <Timer />
          </Route>
        </Routes> */}
      </header>
    </div>
  );
}