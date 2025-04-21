// PomodoroTimer.js
import React, { useState, useEffect, useCallback } from 'react';
import { auth } from './firebase';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlay, FaPause, FaRedo, FaFlag, FaStop, FaHourglassStart } from 'react-icons/fa';
import { motion } from 'framer-motion';

const PomodoroTimer = () => {
 
  const [laps, setLaps] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
  const MIN_DURATION = 300; // 5 minutes
  const MAX_DURATION = 14400; // 4 hours
  const DEFAULT_DURATION = 1500; // 25 minutes

  const [sessionDuration, setSessionDuration] = useState(DEFAULT_DURATION);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  // Session management
  const handleSession = useCallback(async (action) => {
    try {
      const token = await auth.currentUser.getIdToken();
      const payload = {
        action,
        timestamp: new Date().toISOString()
      };

      // Only include duration for start actions
      if (action === 'start') {
        payload.duration = sessionDuration;
      }

      await axios.post(
        `${API_URL}/sessions`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      toast.error(`Session error: ${errorMessage}`);
      if (errorMessage.includes('duration')) {
        // Reset to valid duration if duration error
        handleDurationChange(DEFAULT_DURATION);
      }
    }
  }, [API_URL, sessionDuration]);
  // Timer controls
  const startTimer = useCallback(async () => {
    if (!isRunning) {
      await handleSession('start');
      setIsRunning(true);
      setIsPaused(false);
      toast.success('Focus session started! 🚀');
    }
  }, [handleSession, isRunning]);

  const pauseTimer = useCallback(async () => {
    setIsPaused(!isPaused);
    await handleSession(isPaused ? 'resume' : 'pause');
    toast.info(isPaused ? 'Session resumed ▶' : 'Session paused ⏸');
  }, [handleSession, isPaused]);

  const stopTimer = useCallback(async () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(sessionDuration);
    await handleSession('stop');
    toast.warning('Session stopped ⏹');
  }, [handleSession, sessionDuration]);

  const lapTimer = useCallback(() => {
    setLaps(prev => [...prev, formatTime(timeLeft)]);
    toast.success('Lap recorded ⏱');
  }, [timeLeft]);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      new Audio('/alarm.mp3').play().catch(console.error);
      toast.success('Session complete! 🎉');
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Responsive UI components
  const TimerDisplay = ({ time }) => (
    <motion.div 
      key={time}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className="text-6xl md:text-8xl font-bold text-purple-400 font-mono mb-8"
    >
      {time}
    </motion.div>
  );

  const ControlButton = ({ onClick, children, color, disabled, icon }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`p-3 md:p-4 rounded-xl flex items-center justify-center gap-2 ${
        `bg-${color}-600 hover:bg-${color}-700`} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
      }
    >
      {icon}
      <span className="hidden md:inline">{children}</span>
    </motion.button>
  );
 // Validate duration range
 const validateDuration = useCallback((duration) => {
  return Math.max(MIN_DURATION, Math.min(MAX_DURATION, duration));
}, []);

const handleDurationChange = useCallback((duration) => {
  const validated = Math.max(MIN_DURATION, Math.min(MAX_DURATION, duration));
  setSessionDuration(validated);
  setTimeLeft(validated);
}, []);


const resetTimer = useCallback(async () => {
  setIsRunning(false);
  setIsPaused(false);
  setTimeLeft(sessionDuration);
  setLaps([]);
  await handleSession('reset');
}, [handleSession, sessionDuration]);
// Duration select options

useEffect(() => {
  if (sessionDuration < MIN_DURATION || sessionDuration > MAX_DURATION) {
    handleDurationChange(DEFAULT_DURATION);
    toast.warn(`Session duration reset to ${DEFAULT_DURATION/60} minutes`);
  }
}, [sessionDuration, handleDurationChange]);


return (
    <div>
      {/* Desktop Layout */}
      <div className="hidden md:block max-w-2xl mx-auto p-8 bg-gray-800/50 rounded-2xl shadow-2xl border border-purple-500/30 backdrop-blur-lg">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-purple-300 mb-4">
            <FaHourglassStart className="inline mr-2" />
            Focus Session
          </h2>
          
          <TimerDisplay time={formatTime(timeLeft)} />
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <ControlButton
              onClick={startTimer}
              color="purple"
              disabled={isRunning}
              icon={<FaPlay className="w-6 h-6" />}
            >
              Start
            </ControlButton>
            
            <ControlButton
              onClick={pauseTimer}
              color="yellow"
              disabled={!isRunning}
              icon={isPaused ? <FaPlay className="w-6 h-6" /> : <FaPause className="w-6 h-6" />}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </ControlButton>
            
            <ControlButton
              onClick={stopTimer}
              color="red"
              disabled={!isRunning}
              icon={<FaStop className="w-6 h-6" />}
            >
              Stop
            </ControlButton>
          </div>

          <div className="flex gap-4 justify-center mb-8">
            <ControlButton
              onClick={lapTimer}
              color="blue"
              disabled={!isRunning}
              icon={<FaFlag className="w-6 h-6" />}
            >
              Lap
            </ControlButton>
            
            <ControlButton
              onClick={resetTimer}
              color="gray"
              icon={<FaRedo className="w-6 h-6" />}
            >
              Reset
            </ControlButton>
          </div>

          <div className="mb-8">
            <label className="block text-lg text-gray-300 mb-4">
              Session Duration:
              <select
              value={sessionDuration}
              onChange={(e) => handleDurationChange(Number(e.target.value))}
              disabled={isRunning}
              className="p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
            >
              <option value={300}>5 min</option>
              <option value={600}>10 min</option>
              <option value={900}>15 min</option>
              <option value={1500}>25 min</option>
              <option value={1800}>30 min</option>
              <option value={2700}>45 min</option>
              <option value={3600}>60 min</option>
              <option value={5400}>90 min</option>
              <option value={7200}>2 hrs</option>
              <option value={10800}>3 hrs</option>
              <option value={14400}>4 hrs</option>
            </select>
            </label>
          </div>

          {laps.length > 0 && (
            <div className="bg-gray-700/30 rounded-xl p-6">
              <h3 className="text-xl text-purple-300 mb-4">Session Laps</h3>
              <ul className="space-y-2">
                {laps.map((lap, index) => (
                  <li 
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-600/20 rounded-lg"
                  >
                    <span className="text-gray-300">Lap {index + 1}</span>
                    <span className="font-mono text-purple-400">{lap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden mx-4 p-4 bg-gradient-to-br from-purple-900/30 to-gray-800/50 rounded-2xl border border-purple-400/20 backdrop-blur-lg shadow-lg">
  <div className="text-center space-y-4">
    {/* Header */}
    <div className="flex items-center justify-center gap-2 mb-4">
      <FaHourglassStart className="w-6 h-6 text-purple-400 animate-pulse" />
      <h2 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent">
        Focus Session
      </h2>
    </div>

    {/* Timer Display */}
    <div className="relative w-full aspect-square max-w-[200px] mx-auto mb-4">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full border-4 border-purple-500/20 rounded-full animate-pulse-slow" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div 
          className="text-5xl font-bold text-purple-200 font-mono"
          animate={{ scale: [0.95, 1.05] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }}
        >
          {formatTime(timeLeft)}
        </motion.div>
      </div>
    </div>

    {/* Controls */}
    <div className="grid grid-cols-3 gap-2 mb-4">
      <ControlButton
        onClick={startTimer}
        color="purple"
        disabled={isRunning}
        icon={<FaPlay className="w-6 h-6" />}
        label="Start"
      />
      <ControlButton
        onClick={pauseTimer}
        color="yellow"
        disabled={!isRunning}
        icon={isPaused ? <FaPlay className="w-6 h-6" /> : <FaPause className="w-6 h-6" />}
        label={isPaused ? 'Resume' : 'Pause'}
      />
      <ControlButton
        onClick={stopTimer}
        color="red"
        disabled={!isRunning}
        icon={<FaStop className="w-6 h-6" />}
        label="Stop"
      />
      <ControlButton
        onClick={lapTimer}
        color="blue"
        disabled={!isRunning}
        icon={<FaFlag className="w-6 h-6" />}
        label="Lap"
      />
      <div className="col-span-2">
        <ControlButton
          onClick={resetTimer}
          color="gray"
          icon={<FaRedo className="w-6 h-6" />}
          label="Reset Session"
        />
      </div>
    </div>

    {/* Duration Selector */}
    <div className="mb-4 px-2">
      <label className="flex items-center justify-between text-sm text-purple-200">
        <span>Session Duration:</span>
        <select
          value={sessionDuration}
          onChange={(e) => setSessionDuration(Number(e.target.value))}
          disabled={isRunning}
          className="ml-2 p-2 bg-gray-800/50 rounded-lg border border-purple-500/30 text-purple-200 text-sm"
        >
          <option value={300}>5m</option>
          <option value={600}>10m</option>
          <option value={900}>15m</option>
          <option value={1500}>25m</option>
          <option value={1800}>30m</option>
          <option value={2700}>45m</option>
          <option value={3600}>60m</option>
        </select>
      </label>
    </div>

    {/* Laps */}
    {laps.length > 0 && (
      <div className="bg-gray-800/30 rounded-xl p-3 border border-purple-500/20">
        <h3 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-1">
          <FaFlag className="w-4 h-4" /> Session Laps
        </h3>
        <ul className="space-y-2">
          {laps.map((lap, index) => (
            <motion.li 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex justify-between items-center px-3 py-2 bg-gray-700/20 rounded-lg backdrop-blur-sm"
            >
              <span className="text-xs text-purple-200">Lap {index + 1}</span>
              <span className="font-mono text-sm text-purple-400">{lap}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    )}
  </div>
</div>
    </div>
  );
};

export default PomodoroTimer;