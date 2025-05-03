console.log('background script loaded');

localStorage.setItem("workTime", new Date(Date.now() + 5 * 60 * 1000).toString());

