import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

import s from './index.module.css';

// Create target date in EST (April 21st, 2024 at 8:00 PM EST)
const targetDate = new Date('2025-04-21T20:00:00-05:00');

export default function Home() {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('00:00:00:00');
        clearInterval(timer);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${days.toString().padStart(2, '0')}:${hours
          .toString()
          .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
            .toString()
            .padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home">
      <div className={s.countdown}>
        <div>Soft Launch</div>
        <div>{timeLeft}</div>
      </div>
    </div>
  );
} 