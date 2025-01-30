'use client';

import { useState, useEffect } from 'react';

interface TimeEntry {
  time: number; // Store timestamp as a number
  type: 'IN' | 'OUT';
}

const WORK_LIMIT = 8 * 3600; // 8 hours in seconds

export default function TimeTracker() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [totalTime, setTotalTime] = useState<string>('00:00:00');
  const [remainingTime, setRemainingTime] = useState<string>('08:00:00');
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);

  useEffect(() => {
    const storedData: TimeEntry[] = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const storedDate: string | null = localStorage.getItem('timeEntriesDate');
    const today: string = new Date().toDateString();

    if (storedDate !== today) {
      localStorage.removeItem('timeEntries');
      localStorage.setItem('timeEntriesDate', today);
      setEntries([]);
      setTotalTime('00:00:00');
      setRemainingTime('08:00:00');
      setIsClockedIn(false);
    } else {
      setEntries(storedData);
      setIsClockedIn(storedData.length % 2 !== 0);
      calculateTimes(storedData);
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isClockedIn) {
      interval = setInterval(() => {
        calculateTimes(entries);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClockedIn, entries]);

  const handleTap = (): void => {
    const newEntry: TimeEntry = { 
      time: Date.now(), 
      type: entries.length % 2 === 0 ? 'IN' : 'OUT' 
    };

    const updatedEntries: TimeEntry[] = [...entries, newEntry];
    setEntries(updatedEntries);
    localStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
    setIsClockedIn(updatedEntries.length % 2 !== 0);
    calculateTimes(updatedEntries);
  };

  const calculateTimes = (data: TimeEntry[]): void => {
    let total: number = 0;

    for (let i = 0; i < data.length; i += 2) {
      if (data[i + 1]) {
        total += (data[i + 1].time - data[i].time) / 1000;
      }
    }

    if (isClockedIn && data.length % 2 !== 0) {
      total += (Date.now() - data[data.length - 1].time) / 1000;
    }

    const remaining = Math.max(WORK_LIMIT - total, 0);

    setTotalTime(formatTime(total));
    setRemainingTime(formatTime(remaining));
  };

  const formatTime = (seconds: number): string => {
    const hours: string = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes: string = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const secs: string = String(Math.floor(seconds % 60)).padStart(2, '0');
    return `${hours}:${minutes}:${secs}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Time Tracker</h1>
        <p className="mt-2 text-gray-900 font-semibold">Total Time In: {totalTime}</p>
        <p className="mt-2 text-red-500 font-semibold">Remaining Time: {remainingTime}</p>
        <button 
          onClick={handleTap} 
          className={`w-full mt-4 py-2 px-4 ${isClockedIn ? 'bg-red-500' : 'bg-blue-500'} text-white rounded-md`}
        >
          Tap {isClockedIn ? 'OUT' : 'IN'}
        </button>
        <ul className="mt-4">
          {entries.map((entry, index) => (
            <li key={index} className="flex justify-between py-2 border-b text-gray-700">
              <span>{entry.type}</span>
              <span>{new Date(entry.time).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
