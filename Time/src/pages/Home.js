import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { FaSignOutAlt, FaTasks, FaChartPie, FaClock, FaCalendarDay, FaPlus, FaTrash, FaBars } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBell, FaLightbulb, FaHashtag, FaRunning } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import TaskManager from './components/TaskManager';
import PomodoroTimer from './components/PomodoroTimer';
import Solutions from './components/Solutions';
import ActivityTracker from './components/ActivityTracker';
import SocialMediaTracker from './components/SocialMediaTracker';
import RemindersManager from './components/RemindersManager';
import 'react-toastify/dist/ReactToastify.css';

const HomePage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [sessionDuration, setSessionDuration] = useState(1500);
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
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const getToken = useCallback(async () => {
    return auth.currentUser?.getIdToken();
  }, []);

  // Fetch tasks function moved up
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
        toast.error(error.response?.data?.error || 'Failed to load tasks');
      }
    } finally {
      setLoading(prev => ({ ...prev, tasks: false }));
    }
    return () => controller.abort();
  }, [getToken]);

  // Add task function
  const addTask = useCallback(async (taskData) => {
    try {
      const token = await getToken();
      await axios.post(
        `${process.env.REACT_APP_API_URL}/tasks`,
        {
          title: taskData.title,
          description: taskData.description,
          importance: taskData.importance
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchTasks();
      toast.success('Task added successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add task');
    }
  }, [getToken, fetchTasks]);

  // Delete task function
  const deleteTask = useCallback(async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = await getToken();
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchTasks();
      toast.success('Task deleted');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  }, [getToken, fetchTasks]);

  // Toggle task function
  const toggleTask = useCallback(async (taskId, completed) => {
    try {
      const token = await getToken();
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/tasks/${taskId}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(prev => prev.map(task => 
        task._id === taskId ? data : task
      ));
    } catch (error) {
      toast.error(error.response?.data?.error || 'Update failed');
      await fetchTasks();
    }
  }, [getToken, fetchTasks]);

  // Rest of your existing code
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setShowMobileMenu(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      }
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
    return () => controller.abort();
  }, [getToken]);

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

  useEffect(() => {
    if (activeTab === 'tasks') fetchTasks();
    fetchStats();
  }, [activeTab, fetchTasks, fetchStats]);

  // Rest of timer-related functions and effects
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

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const taskVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <nav className="px-4 sm:px-6 py-4 border-b border-gray-700 backdrop-blur-sm bg-gray-900/80">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/" className="mr-16 text-xl sm:text-2xl font-bold text-purple-400 flex items-center gap-2 hover:text-purple-300 transition-colors">
              <FaCalendarDay className="w-5 h-5 sm:w-6 sm:h-6" /> FOCUS
            </Link>
            <div className="hidden md:flex gap-6 ml-4">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 ${activeTab === 'dashboard' ? 'text-purple-400' : 'text-gray-300 hover:text-purple-300'} transition-colors`}
              >
                <FaChartPie className="w-5 h-5" /> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('solutions')}
                className={`flex items-center gap-2 ${activeTab === 'solutions' ? 'text-purple-400' : 'text-gray-300 hover:text-purple-300'} transition-colors`}
              >
                <FaLightbulb className="w-5 h-5" /> Solutions
              </button>
              <button 
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-2 ${activeTab === 'tasks' ? 'text-purple-400' : 'text-gray-300 hover:text-purple-300'} transition-colors`}
              >
                <FaTasks className="w-5 h-5" /> Tasks
              </button>
              <button 
                onClick={() => setActiveTab('pomodoro')}
                className={`flex items-center gap-2 ${activeTab === 'pomodoro' ? 'text-purple-400' : 'text-gray-300 hover:text-purple-300'} transition-colors`}
              >
                <FaClock className="w-5 h-5" /> Pomodoro
              </button>
              <button 
                onClick={() => setActiveTab('reminders')}
                className={`flex items-center gap-2 ${activeTab === 'reminders' ? 'text-purple-400' : 'text-gray-300 hover:text-purple-300'} transition-colors`}
              >
                <FaBell className="w-5 h-5" /> Reminders
              </button>
              <button 
                onClick={() => setActiveTab('activity')}
                className={`flex items-center gap-2 ${activeTab === 'activity' ? 'text-purple-400' : 'text-gray-300 hover:text-purple-300'}`}
              >
                <FaRunning className="w-5 h-5" /> Activity
              </button>

              <button 
                onClick={() => setActiveTab('social')}
                className={`flex items-center gap-2 ${activeTab === 'social' ? 'text-purple-400' : 'text-gray-300 hover:text-purple-300'}`}
              >
                <FaHashtag className="w-5 h-5" /> Social
              </button>

            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-gray-300 hover:text-purple-300 p-2 rounded-lg"
            >
              <FaBars className="w-6 h-6" />
            </button>
            <button 
              onClick={() => auth.signOut()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm sm:text-base"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 space-y-2"
            >
              <button 
                onClick={() => { setActiveTab('dashboard'); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-lg flex items-center gap-2"
              >
                <FaChartPie className="w-5 h-5" /> Dashboard
              </button>
              <button 
                onClick={() => { setActiveTab('solutions'); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-lg flex items-center gap-2"
                              >
                <FaLightbulb className="w-5 h-5" /> Solutions
              </button>
              <button 
                onClick={() => { setActiveTab('tasks'); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-lg flex items-center gap-2"
              >
                <FaTasks className="w-5 h-5" /> Tasks
              </button>
              <button 
                onClick={() => { setActiveTab('pomodoro'); setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-lg flex items-center gap-2"
              >
                <FaClock className="w-5 h-5" /> Pomodoro
              </button>
              <button 
                onClick={() => {setActiveTab('reminders');setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-lg flex items-center gap-2">
                <FaBell className="w-5 h-5" /> Reminders
              </button>
              <button 
                onClick={() => {setActiveTab('activity');setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-lg flex items-center gap-2">              
                <FaRunning className="w-5 h-5" /> Activity
              </button>

              <button 
                onClick={() => {setActiveTab('social');setShowMobileMenu(false); }}
                className="w-full text-left px-4 py-3 hover:bg-gray-800 rounded-lg flex items-center gap-2">              
                <FaHashtag className="w-5 h-5" /> Social
              </button>

            </motion.div>
            
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto py-6 px-4 sm:px-6">
        {activeTab === 'dashboard' && (
          <Dashboard 
            stats={stats} 
            loading={loading.stats} 
            setActiveTab={setActiveTab}
          />
        )}

{activeTab === 'tasks' && (
  <TaskManager
    tasks={tasks}
    loading={loading.tasks}
    addTask={addTask}
    toggleTask={toggleTask}
    deleteTask={deleteTask}
  />
)}
        {activeTab === 'pomodoro' && (
          <PomodoroTimer
            sessionDuration={sessionDuration}
            setSessionDuration={setSessionDuration}
            timeLeft={timeLeft}
            laps={laps}
            isPaused={isPaused}
            isRunning={isRunning}
            startTimer={startTimer}
            pauseTimer={pauseTimer}
            lapTimer={lapTimer}
            stopTimer={stopTimer}
            resetTimer={resetTimer}
            formatTime={formatTime}
          />
        )}
       {activeTab === 'reminders' && (
        <RemindersManager tasks={tasks} loading={loading.tasks} />
      )}
      {activeTab === 'solutions' && <Solutions />}
      {activeTab === 'activity' && <ActivityTracker />}
{activeTab === 'social' && <SocialMediaTracker />}
      </main>

      <footer className="mt-auto py-4 sm:py-6 px-4 sm:px-6 border-t border-gray-700 backdrop-blur-sm bg-gray-900/80">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between text-gray-400 gap-3 sm:gap-0 text-center sm:text-left text-sm sm:text-base">
          <div className="flex items-center gap-2 justify-center">
            <FaClock className="w-4 h-4" />
            Total Focus: {Math.floor(stats.totalFocus / 3600)}h {Math.floor((stats.totalFocus % 3600) / 60)}m
          </div>
          <div className="flex items-center gap-2 justify-center">
            <FaTasks className="w-4 h-4" />
            Completed Tasks: {stats.tasksCompleted}
          </div>
          <div className="flex items-center gap-2 justify-center">
            <FaChartPie className="w-4 h-4" />
            Current Streak: {stats.currentStreak} days
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;