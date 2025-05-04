import React, { useEffect, useState } from 'react';
import logo from '@assets/img/logo.png';
import '@pages/newtab/Newtab.css'; // Ensure this CSS file exists and styles appropriately

// --- Constants ---
const PRODUCTIVITY_MODE = 'PRODUCTIVITY';
const BREAK_MODE_SELECT = 'BREAK_SELECT';
const BREAK_MODE_TIMER = 'BREAK_TIMER';
const BREAK_ACTIVITIES = ["activity 1", "activity 2", "activity 3"];
const ENCOURAGEMENTS = [
  "Great job staying focused!",
  "Keep up the amazing work!",
  "You're doing great!",
  "Almost there, keep pushing!",
  "Focus brings rewards!",
  "Enjoy your well-deserved break!",
  "Recharge and come back stronger!",
  "Rest is productive too!",
  "Taking a break is smart work!",
];

// --- Helper Functions ---
function getRandomItems(arr: string[], num: number): string[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
}

function formatTime(ms: number): string {
  if (ms <= 0) return "0m 0s";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

// --- Component ---
export default function Newtab() {
  const [points, setPoints] = useState(0);
  const [mode, setMode] = useState<string>(PRODUCTIVITY_MODE); // PRODUCTIVITY, BREAK_SELECT, BREAK_TIMER
  const [isProductive, setIsProductive] = useState<boolean>(true); // To sync with storage

  // Productivity Timer State
  const [prodRemainingTime, setProdRemainingTime] = useState<string>("");
  const [prodSelectedMinutes, setProdSelectedMinutes] = useState(20);
  const [prodTimerRunning, setProdTimerRunning] = useState(false);

  // Break Timer State
  const [breakRemainingTime, setBreakRemainingTime] = useState<string>("");
  const [breakSelectedMinutes, setBreakSelectedMinutes] = useState(5);
  const [breakTimerRunning, setBreakTimerRunning] = useState(false);
  const [breakActivityOptions, setBreakActivityOptions] = useState<string[]>([]);
  const [selectedBreakActivity, setSelectedBreakActivity] = useState<string | null>(null);
  const [encouragement, setEncouragement] = useState<string>("");

  // --- Effects ---

  // Effect to Sync with Storage and Set Mode
  useEffect(() => {
    const syncState = () => {
      chrome.storage.local.get(['isProductive', 'points', 'workTime', 'breakTime'], (result) => {
        const productive = result.isProductive ?? true; // Default to productive
        const currentPoints = parseInt(result.points || '0', 10);
        const workTime = result.workTime;
        const breakTime = result.breakTime;

        setIsProductive(productive);
        setPoints(currentPoints);

        if (productive) {
          setMode(PRODUCTIVITY_MODE);
          setProdTimerRunning(!!workTime);
          setBreakTimerRunning(false); // Ensure break timer is off
          setSelectedBreakActivity(null); // Reset break activity
        } else {
          // In Break Mode
          if (breakTime) {
            setMode(BREAK_MODE_TIMER);
            setBreakTimerRunning(true);
          } else {
            setMode(BREAK_MODE_SELECT);
            setBreakTimerRunning(false);
            setBreakActivityOptions(BREAK_ACTIVITIES); // TODO: RANDOMIZE
          }
          setProdTimerRunning(false); // Ensure prod timer is off
        }
      });
    };

    syncState(); // Initial sync

    // Listen for changes in storage
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'local' && (changes.isProductive || changes.points || changes.workTime || changes.breakTime)) {
        console.log("Storage changed, syncing Newtab state:", changes);
        syncState();
      }
    };
    chrome.storage.onChanged.addListener(listener);

    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);


  // Effect for Timers and Title Update
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    let encouragementIntervalId: NodeJS.Timeout | null = null;

    const updateTimers = () => {
      const currentTime = Date.now();
      let currentRemainingTime = "";
      let currentTitle = "New Tab";

      if (mode === PRODUCTIVITY_MODE && prodTimerRunning) {
        chrome.storage.local.get('workTime', (result) => {
          if (result.workTime) {
            const workTimeMs = new Date(result.workTime).getTime();
            const timeLeft = workTimeMs - currentTime;
            currentRemainingTime = formatTime(timeLeft);
            setProdRemainingTime(currentRemainingTime);
            if (timeLeft <= 0) {
              // Timer likely expired, background script will handle state change
              setProdTimerRunning(false);
              setProdRemainingTime("Time's up!");
              currentTitle = "Time's up!";
            } else {
               currentTitle = currentRemainingTime;
            }
             document.title = currentTitle;
          } else {
             // workTime might have been cleared by background script
             setProdTimerRunning(false);
             setProdRemainingTime("");
             document.title = "New Tab";
          }
        });
      } else if (mode === BREAK_MODE_TIMER && breakTimerRunning) {
        chrome.storage.local.get('breakTime', (result) => {
           if (result.breakTime) {
              const breakTimeMs = new Date(result.breakTime).getTime();
              const timeLeft = breakTimeMs - currentTime;
              currentRemainingTime = formatTime(timeLeft);
              setBreakRemainingTime(currentRemainingTime);
              if (timeLeft <= 0) {
                // Timer likely expired, background script will handle state change
                setBreakTimerRunning(false);
                setBreakRemainingTime("Break Over!");
                currentTitle = "Break Over!";
              } else {
                 currentTitle = `Break: ${currentRemainingTime}`;
              }
              document.title = currentTitle;
           } else {
              // breakTime might have been cleared
              setBreakTimerRunning(false);
              setBreakRemainingTime("");
              document.title = "New Tab";
           }
        });
      } else {
        setProdRemainingTime("");
        setBreakRemainingTime("");
        document.title = "New Tab";
      }
    };

    const showRandomEncouragement = () => {
       if (mode === BREAK_MODE_TIMER && breakTimerRunning) {
           setEncouragement(ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]);
       } else {
           setEncouragement(""); // Clear encouragement if not in break timer mode
       }
    };


    updateTimers(); // Initial call
    intervalId = setInterval(updateTimers, 1000); // Update timer display every second

    // Show encouragement periodically during break
    if (mode === BREAK_MODE_TIMER && breakTimerRunning) {
        showRandomEncouragement(); // Show one immediately
        encouragementIntervalId = setInterval(showRandomEncouragement, 30 * 1000); // Change every 30 seconds
    }


    return () => {
      if (intervalId) clearInterval(intervalId);
      if (encouragementIntervalId) clearInterval(encouragementIntervalId);
      document.title = "New Tab"; // Reset title on unmount
    };
  }, [mode, prodTimerRunning, breakTimerRunning]); // Rerun when mode or timer status changes


  // --- Event Handlers ---

  const startProdTimer = () => {
    if (!prodTimerRunning) {
      const newWorkTime = new Date(Date.now() + prodSelectedMinutes * 60 * 1000).toString();
      // Set workTime and ensure isProductive is true
      chrome.storage.local.set({ workTime: newWorkTime, isProductive: true, breakTime: null }, () => {
        setProdTimerRunning(true);
        setMode(PRODUCTIVITY_MODE); // Ensure mode is correct
        console.log("Productivity timer started");
      });
    }
  };

  const handleBreakActivitySelect = (activity: string) => {
    setSelectedBreakActivity(activity);
    // Don't start timer yet, just move to timer selection view potentially
    // Or directly start a default timer? Let's require setting duration.
  };

  const startBreakTimer = () => {
     if (!breakTimerRunning && selectedBreakActivity) {
        const newBreakTime = new Date(Date.now() + breakSelectedMinutes * 60 * 1000).toString();
        chrome.storage.local.set({ breakTime: newBreakTime, isProductive: false }, () => {
            setBreakTimerRunning(true);
            setMode(BREAK_MODE_TIMER); // Switch view to running timer
            console.log("Break timer started for:", selectedBreakActivity);
        });
     }
  };


  // --- Render Logic ---

  const renderProductivityMode = () => (
    <>
      <p>
        Remaining work time: <strong>{prodRemainingTime || "Not started"}</strong>
      </p>
      {!prodTimerRunning && (
        <div className="mt-4">
          <label htmlFor="timerSelect" className="mr-2 text-white">
            Select Timer Duration:
          </label>
          <select
            id="timerSelect"
            value={prodSelectedMinutes}
            onChange={(e) => setProdSelectedMinutes(parseInt(e.target.value, 10))}
            className="px-2 py-1 rounded text-black" // Added text-black for visibility
            disabled={prodTimerRunning}
          >
            {Array.from({ length: 60 }, (_, i) => i + 1).map(min => ( // Increased range
              <option key={min} value={min}>{min} minutes</option>
            ))}
          </select>
          <button
            onClick={startProdTimer}
            className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-white"
            disabled={prodTimerRunning}
          >
            Start Timer
          </button>
        </div>
      )}
      {prodTimerRunning && (
        <p className="mt-4 text-white">
          Work timer is running. Stay focused!
        </p>
      )}
    </>
  );

  const renderBreakSelectMode = () => (
    <>
      <p className="text-xl mb-4">Time for a break! Choose an activity:</p>
      <div className="flex justify-center gap-4 mb-4">
        {breakActivityOptions.map(activity => (
          <button
            key={activity}
            onClick={() => handleBreakActivitySelect(activity)}
            className={`px-4 py-2 rounded ${selectedBreakActivity === activity ? 'bg-green-600' : 'bg-gray-600 hover:bg-gray-500'} text-white`}
          >
            {activity}
          </button>
        ))}
      </div>
      {selectedBreakActivity && (
         <div className="mt-4">
            <p className="mb-2">Set break duration for: <strong>{selectedBreakActivity}</strong></p>
            <label htmlFor="breakTimerSelect" className="mr-2 text-white">
              Duration:
            </label>
            <select
              id="breakTimerSelect"
              value={breakSelectedMinutes}
              onChange={(e) => setBreakSelectedMinutes(parseInt(e.target.value, 10))}
              className="px-2 py-1 rounded text-black"
            >
              {Array.from({ length: 30 }, (_, i) => (i + 1) * 1).map(min => ( // Shorter breaks typical
                <option key={min} value={min}>{min} minutes</option>
              ))}
            </select>
            <button
              onClick={startBreakTimer}
              className="ml-4 px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-white"
            >
              Start Break
            </button>
          </div>
      )}
    </>
  );

   const renderBreakTimerMode = () => (
    <>
      <p className="text-xl mb-2">Enjoy your break!</p>
      {selectedBreakActivity && <p className="mb-4">Activity: <strong>{selectedBreakActivity}</strong></p>}
      <p>
        Remaining break time: <strong>{breakRemainingTime || "Not started"}</strong>
      </p>
       {encouragement && <p className="mt-4 text-lg italic text-yellow-300">{encouragement}</p>}
    </>
  );


  // Determine background class based on mode
  const backgroundClass = isProductive ? 'App-header-productive' : 'App-header-break';


  return (
    // Added dynamic background class and basic light/dark theme differentiation
    <div className={`App ${isProductive ? 'theme-dark' : 'theme-light'}`}>
       {/* Apply dynamic class to header */}
      <header className={`App-header ${backgroundClass}`}>
        <img src={logo} className="App-logo" alt="logo" />
        <p className="text-2xl mb-4">
          You have <strong>{points}</strong> points.
        </p>

        {mode === PRODUCTIVITY_MODE && renderProductivityMode()}
        {mode === BREAK_MODE_SELECT && renderBreakSelectMode()}
        {mode === BREAK_MODE_TIMER && renderBreakTimerMode()}

      </header>
    </div>
  );
}