import React, { useState, useEffect, useMemo } from 'react';
import logo from '@assets/img/logo.svg';

const SECOND = 1000;
const MINUTE = SECOND * 60;

export default function Popup({ deadline = new Date().toString() }) {
  if (deadline=="") {
    return (
      <div className="timer">
            <h1>
              Enter time on main screen to start
            </h1>
        </div>
    );
  }
  const parsedDeadline = useMemo(() => Date.parse(deadline), [deadline]);
  const [time, setTime] = useState(parsedDeadline - Date.now());
  useEffect(() => {
    const interval = setInterval(
        () => setTime(parsedDeadline - Date.now()),
        1000,
    );

    return () => clearInterval(interval);
}, []);
  return (
    <div className="timer">
            {Object.entries({
                //Hours: 24,
                Minutes: (time/MINUTE) % 60,
                Seconds: (time / SECOND) % 60,
            }).map(([label, value]) => (
                <div key={label} className="col-4">
                    <div className="box">
                        <p>{`${Math.floor(value)}`.padStart(2, "0")}</p>
                        <span className="text">{label}</span>
                    </div>
                </div>
            ))}
        </div>
  );
}
