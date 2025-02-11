import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ minutes }) => {
  const [time, setTime] = useState(minutes * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prevTime) => Math.max(prevTime - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return <div>残り時間: {formatTime()}</div>;
};

export default CountdownTimer;

