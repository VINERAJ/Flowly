import React from 'react';
import logo from '@assets/img/logo.svg';

export default function Popup() {
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

  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 text-center h-full p-3 bg-gray-800">
      <header className="flex flex-col items-center justify-center text-white">
        <img
          src={logo}
          className="h-36 pointer-events-none animate-spin-slow"
          alt="logo"
        />
        <p>Edit <code>src/pages/popup/Popup.tsx</code> and save to reload.</p>
        <a
          className="text-blue-400"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React!
        </a>
        <p>Popup styled with TailwindCSS!</p>
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