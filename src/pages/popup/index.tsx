import React from 'react';
import { createRoot } from 'react-dom/client';
import '@pages/popup/index.css';
import '@assets/styles/tailwind.css';
import Popup from '@pages/popup/Popup';

function init() {
  const rootContainer = document.querySelector("#__root");
  if (!rootContainer) throw new Error("Can't find Popup root element");
  const root = createRoot(rootContainer);
  const storedTime = localStorage.getItem('workTime');
  const workTime = storedTime ? storedTime : 0;
  if (!storedTime) {
    root.render(<Popup deadline={""}/>)
  } else {
    // const time = new Date(Date.now() + workTime * 60 * 1000)
    root.render(<Popup deadline={storedTime}/>);
  }
}

init();
