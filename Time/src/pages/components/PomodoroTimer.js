import React from 'react';

const PomodoroTimer = ({ 
  sessionDuration,
  setSessionDuration,
  timeLeft,
  laps,
  isPaused,
  isRunning,
  startTimer,
  pauseTimer,
  lapTimer,
  stopTimer,
  resetTimer,
  formatTime
}) => {
  return (
    <div className="p-4 sm:p-6 bg-gray-700/30 rounded-xl backdrop-blur-sm border border-gray-600 text-center">
      <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">Focus Timer</h2>

      <div className="mb-4 flex flex-col sm:flex-row items-center justify-center gap-2">
        <label className="text-base sm:text-lg font-medium">Select Duration:</label>
        <select
          value={sessionDuration}
          onChange={(e) => setSessionDuration(Number(e.target.value))}
          disabled={isRunning}
          className="p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm sm:text-base"
        >
          <option value={300}>5 min</option>
          <option value={600}>10 min</option>
          <option value={900}>15 min</option>
          <option value={1500}>25 min</option>
          <option value={1800}>30 min</option>
          <option value={3600}>60 min</option>
        </select>
      </div>

      <div className="text-4xl sm:text-6xl font-bold mb-6 sm:mb-8 font-mono">
        {formatTime(timeLeft)}
      </div>

      <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
        <button 
          onClick={startTimer}
          disabled={isRunning}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-lg font-semibold transition-all ${
            isRunning ? 'bg-purple-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          ▶ Start
        </button>
        <button 
          onClick={pauseTimer}
          disabled={!isRunning}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-sm sm:text-lg font-semibold"
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>
        <button 
          onClick={lapTimer}
          disabled={!isRunning}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm sm:text-lg font-semibold"
        >
          ⏱ Lap
        </button>
        <button 
          onClick={stopTimer}
          disabled={!isRunning}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-red-600 hover:bg-red-700 rounded-xl text-sm sm:text-lg font-semibold"
        >
          ⏹ Stop
        </button>
        <button 
          onClick={resetTimer}
          className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-sm sm:text-lg font-semibold"
        >
          🔄 Reset
        </button>
      </div>

      {laps.length > 0 && (
        <div className="mt-4 sm:mt-6 text-left">
          <h3 className="text-base sm:text-lg font-semibold mb-2">Laps:</h3>
          <ul className="bg-gray-800 p-3 sm:p-4 rounded-lg max-h-32 sm:max-h-40 overflow-y-auto text-xs sm:text-sm">
            {laps.map((lap, index) => (
              <li key={index} className="py-1 border-b border-gray-700">
                Lap {index + 1}: {lap}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;