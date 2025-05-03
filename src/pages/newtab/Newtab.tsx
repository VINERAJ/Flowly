import React from 'react';
import logo from '@assets/img/logo.svg';
import '@pages/newtab/Newtab.css';
import { Link,Route, Routes } from 'react-router-dom';
import Timer from '../timer/Timer';

export default function Newtab() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
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
