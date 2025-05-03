import React, { useEffect, useState } from 'react';
import logo from '@assets/img/logo.svg';
import '@pages/newtab/Newtab.css';

export default function Newtab() {
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