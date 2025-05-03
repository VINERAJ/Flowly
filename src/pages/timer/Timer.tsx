import React from "react";

const Timer = () => {
    return (
        <div className="timer">
            {Object.entries({
                Days: 24,
                Hours: 24,
                Minutes: 60,
                Seconds: 60,
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
};

export default Timer