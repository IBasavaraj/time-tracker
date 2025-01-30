'use client';

import { useState, useEffect } from 'react';

interface TimeEntry {
  time: string;
  type: 'IN' | 'OUT';
}

export default function TimeTracker() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [totalTime, setTotalTime] = useState<string>('00:00:00');

  useEffect(() => {
    const storedData: TimeEntry[] = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const storedDate: string | null = localStorage.getItem('timeEntriesDate');
    const today: string = new Date().toDateString();

    if (storedDate !== today) {
      localStorage.removeItem('timeEntries');
      localStorage.setItem('timeEntriesDate', today);
      setEntries([]);
      setTotalTime('00:00:00');
    } else {
      setEntries(storedData);
      calculateTotalTime(storedData);
    }
  }, []);

  const handleTap = (): void => {
    const newEntry: TimeEntry = { 
      time: new Date().toLocaleTimeString(), 
      type: entries.length % 2 === 0 ? 'IN' : 'OUT' 
    };
    const updatedEntries: TimeEntry[] = [...entries, newEntry];
    setEntries(updatedEntries);
    localStorage.setItem('timeEntries', JSON.stringify(updatedEntries));
    calculateTotalTime(updatedEntries);
  };

  const calculateTotalTime = (data: TimeEntry[]): void => {
    let total: number = 0;
    for (let i = 0; i < data.length; i += 2) {
      if (data[i + 1]) {
        const inTime: number = new Date(`1970/01/01 ${data[i].time}`).getTime();
        const outTime: number = new Date(`1970/01/01 ${data[i + 1].time}`).getTime();
        total += (outTime - inTime) / 1000; // Convert milliseconds to seconds
      }
    }
    const hours: string = String(Math.floor(total / 3600)).padStart(2, '0');
    const minutes: string = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
    const seconds: string = String(Math.floor(total % 60)).padStart(2, '0');
    setTotalTime(`${hours}:${minutes}:${seconds}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">Time Tracker</h1>
        <p className="mt-4 text-gray-900 font-medium">Total Time In: {totalTime}</p>
        <button 
          onClick={handleTap} 
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md"
        >
          Tap {entries.length % 2 === 0 ? 'IN' : 'OUT'}
        </button>
        <ul className="mt-4">
          {entries.map((entry, index) => (
            <li key={index} className="flex justify-between py-2 border-b text-gray-700">
              <span>{entry.type}</span>
              <span>{entry.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}