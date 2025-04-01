import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { FaSignOutAlt, FaTasks, FaChartPie, FaClock, FaCalendarDay, FaPlus, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [sessionDuration, setSessionDuration] = useState(1500); // Default: 25 minutes
  const [timeLeft, setTimeLeft] = useState(sessionDuration);
  const [laps, setLaps] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [stats, setStats] = useState({ 
    tasksCompleted: 0, 
    totalFocus: 0, 
    currentStreak: 0 
  });
  const [loading, setLoading] = useState({
    tasks: true,
    stats: true,
    session: false
  });

  // Memoized API call functions
  const getToken = useCallback(async () => {
    return auth.currentUser?.getIdToken();
  }, []);

  // Enhanced fetch functions with abort controller
  const fetchTasks = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(prev => ({ ...prev, tasks: true }));
      const token = await getToken();
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/tasks`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal 
        }
      );
      setTasks(data);
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error('Failed to load tasks');
        console.error('Task fetch error:', error);
      }
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
    return () => controller.abort();
  }, [getToken]);

  const fetchStats = useCallback(async () => {
    const controller = new AbortController();
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const token = await getToken();
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/stats`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal 
        }
      );
      setStats({
        tasksCompleted: data.tasksCompleted || 0,
        totalFocus: data.totalFocus || 0,
        currentStreak: data.currentStreak || 0
      });
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast.error('Failed to load statistics');
        console.error('Stats fetch error:', error);
      }
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
    return () => controller.abort();
  }, [getToken]);

  // Real-time updates with WebSocket
  useEffect(() => {
    const ws = new WebSocket(`wss://${window.location.host}/ws`);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'DATA_UPDATE') {
        fetchTasks();
        fetchStats();
      }
    };

    return () => ws.close();
  }, [fetchTasks, fetchStats]);

  // Data fetching effects
  useEffect(() => {
    if (activeTab === 'tasks') fetchTasks();
    fetchStats();
  }, [activeTab, fetchTasks, fetchStats]);

  // Timer functionality
  const alarmSound = new Audio('/alarm.mp3');

  const handleTimerAction = useCallback(async (action) => {
    try {
      const token = await getToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/sessions`,
        {
          action,
          duration: sessionDuration,
          timestamp: new Date().toISOString()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      toast.error(`Failed to ${action} session`);
      console.error('Session error:', error);
    }
  }, [getToken, sessionDuration]);

  const startTimer = useCallback(async () => {
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false);
      setTimeLeft(sessionDuration);
      await handleTimerAction('start');
    }
  }, [handleTimerAction, isRunning, sessionDuration]);

  const pauseTimer = useCallback(async () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? 'Timer resumed' : 'Timer paused');
    await handleTimerAction(isPaused ? 'resume' : 'pause');
  }, [handleTimerAction, isPaused]);

  const lapTimer = useCallback(() => {
    setLaps(prev => [...prev, formatTime(timeLeft)]);
  }, [timeLeft]);

  const stopTimer = useCallback(async () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(sessionDuration);
    setLaps([]);
    toast.warning('Session stopped');
    await handleTimerAction('stop');
  }, [handleTimerAction, sessionDuration]);

  const resetTimer = useCallback(async () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(sessionDuration);
    setLaps([]);
    toast.success('Timer reset');
    await handleTimerAction('reset');
  }, [handleTimerAction, sessionDuration]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      toast.success('Focus session completed!');
      alarmSound.play().catch(console.error);
      fetchStats();
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, timeLeft, alarmSound, fetchStats]);

  // Format time display
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Task functions
  const addTask = useCallback(async () => {
    if (!newTask.trim()) {
      toast.error('Task cannot be empty');
      return;
    }
    
    try {
      const token = await getToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/tasks`,
        { text: newTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewTask('');
      await fetchTasks();
      toast.success('Task added successfully');
    } catch (error) {
      toast.error('Failed to add task');
      console.error('Add task error:', error);
    }
  }, [getToken, newTask, fetchTasks]);

  const toggleTask = useCallback(async (taskId, completed) => {
    try {
      const token = await getToken();
      await axios.put(
        `${process.env.REACT_APP_API_URL}/tasks/${taskId}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchTasks();
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
      console.error('Task toggle error:', error);
    }
  }, [getToken, fetchTasks]);

  const deleteTask = useCallback(async (taskId) => {
    try {
      const token = await getToken();
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchTasks();
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
      console.error('Task delete error:', error);
    }
  }, [getToken, fetchTasks]);

  // Animation variants
  const taskVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  return (
    <div className="flex-row min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-gray-700 backdrop-blur-sm bg-gray-900/80">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-purple-400 flex items-center gap-2 hover:text-purple-300 transition-colors">
              <FaCalendarDay className="w-6 h-6" /> FOCUS
            </Link>
            <div className="flex gap-6 ml-8">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 ${
                  activeTab === 'dashboard' 
                    ? 'text-purple-400' 
                    : 'text-gray-300 hover:text-purple-300'
                } transition-colors`}
              >
                <FaChartPie className="w-5 h-5" /> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-2 ${
                  activeTab === 'tasks' 
                    ? 'text-purple-400' 
                    : 'text-gray-300 hover:text-purple-300'
                } transition-colors`}
              >
                <FaTasks className="w-5 h-5" /> Tasks
              </button>
              <button 
                onClick={() => setActiveTab('pomodoro')}
                className={`flex items-center gap-2 ${
                  activeTab === 'pomodoro' 
                    ? 'text-purple-400' 
                    : 'text-gray-300 hover:text-purple-300'
                } transition-colors`}
              >
                <FaClock className="w-5 h-5" /> Pomodoro
              </button>
            </div>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl mx-auto py-8 px-6">
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-gray-700/30 rounded-xl backdrop-blur-sm border border-gray-600">
              <h2 className="text-2xl font-semibold mb-4">Today's Overview</h2>
              <div className="h-64 bg-gray-800/50 rounded-lg flex items-center justify-center">
                {loading.stats ? (
                  <div className="animate-pulse text-gray-400">Loading chart...</div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400">
                      {Math.floor(stats.totalFocus / 3600)}h
                    </div>
                    <div className="text-gray-300">Total Focus Today</div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 bg-gray-700/30 rounded-xl backdrop-blur-sm border border-gray-600">
              <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setActiveTab('tasks')}
                  className="p-4 bg-purple-600/30 hover:bg-purple-700/30 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaPlus /> Add Task
                </button>
                <button 
                  onClick={() => setActiveTab('pomodoro')}
                  className="p-4 bg-purple-600/30 hover:bg-purple-700/30 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  <FaClock /> Start Focus
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="p-6 bg-gray-700/30 rounded-xl backdrop-blur-sm border border-gray-600">
            <h2 className="text-2xl font-semibold mb-6">Task Management</h2>
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add new task..."
                className="flex-1 p-3 bg-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
              />
              <button 
                onClick={addTask}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
              >
                <FaPlus /> Add
              </button>
            </div>
            
            {loading.tasks ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-800/50 rounded-lg"></div>
                ))}
              </div>
            ) : (
              <AnimatePresence>
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No tasks found. Add your first task!
                  </div>
                ) : (
                  <motion.div className="space-y-4">
                    {tasks.map((task) => (
                      <motion.div
                        key={task._id}
                        variants={taskVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="p-4 bg-gray-800/50 rounded-lg flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task._id, task.completed)}
                            className="w-5 h-5 accent-purple-400 cursor-pointer"
                          />
                          <span className={`flex-1 ${task.completed ? 'line-through text-gray-400' : ''}`}>
                            {task.text}
                          </span>
                          <span className="text-sm text-gray-400">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FaTrash />
                        </button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        )}

{activeTab === 'pomodoro' && (
  <div className="p-6 bg-gray-700/30 rounded-xl backdrop-blur-sm border border-gray-600 text-center">
    <h2 className="text-2xl font-semibold mb-6">Focus Timer</h2>

    {/* Dropdown for selecting time */}
    <div className="mb-4">
      <label className="text-lg font-medium mr-2">Select Duration:</label>
      <select
        value={sessionDuration}
        onChange={(e) => setSessionDuration(parseInt(e.target.value))}
        disabled={isRunning}
        className="p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
      >
        <option value={300}>5 min</option>
        <option value={600}>10 min</option>
        <option value={900}>15 min</option>
        <option value={1500}>25 min</option>
        <option value={1800}>30 min</option>
        <option value={3600}>60 min</option>
      </select>
    </div>

    <div className="text-6xl font-bold mb-8 font-mono">
      {formatTime(timeLeft)}
    </div>

    {/* Timer Controls */}
    <div className="flex justify-center gap-4">
      <button 
        onClick={startTimer}
        disabled={isRunning}
        className={`px-6 py-3 rounded-xl text-lg font-semibold transition-all ${
          isRunning ? 'bg-purple-700 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        ▶ Start
      </button>
      <button 
        onClick={pauseTimer}
        disabled={!isRunning}
        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-xl text-lg font-semibold"
      >
        {isPaused ? '▶ Resume' : '⏸ Pause'}
      </button>
      <button 
        onClick={lapTimer}
        disabled={!isRunning}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-lg font-semibold"
      >
        ⏱ Lap
      </button>
      <button 
        onClick={stopTimer}
        disabled={!isRunning}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-lg font-semibold"
      >
        ⏹ Stop
      </button>
      <button 
        onClick={resetTimer}
        className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl text-lg font-semibold"
      >
        🔄 Reset
      </button>
    </div>

    {/* Display Laps */}
    {laps.length > 0 && (
      <div className="mt-6 text-left">
        <h3 className="text-lg font-semibold mb-2">Laps:</h3>
        <ul className="bg-gray-800 p-4 rounded-lg max-h-40 overflow-y-auto">
          {laps.map((lap, index) => (
            <li key={index} className="text-sm py-1 border-b border-gray-700">
              Lap {index + 1}: {lap}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
)}
      </main>

      {/* Stats Footer */}
       {/* Footer (Sticky at Bottom) */}
  <footer className="mt-auto py-6 px-6 border-t border-gray-700 backdrop-blur-sm bg-gray-900/80">
    <div className="max-w-6xl mx-auto flex justify-between text-gray-400">
      <div className="flex items-center gap-2">
        <FaClock className="w-5 h-5" />
        Total Focus: {Math.floor(stats.totalFocus / 3600)}h {Math.floor((stats.totalFocus % 3600) / 60)}m
      </div>
      <div className="flex items-center gap-2">
        <FaTasks className="w-5 h-5" />
        Completed Tasks: {stats.tasksCompleted}
      </div>
      <div className="flex items-center gap-2">
        <FaChartPie className="w-5 h-5" />
        Current Streak: {stats.currentStreak} days
      </div>
    </div>
  </footer>
</div>
  );
};

export default HomePage;