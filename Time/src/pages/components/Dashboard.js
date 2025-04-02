import React from 'react';
import { FaChartPie, FaTasks, FaClock, FaPlus } from 'react-icons/fa';

const Dashboard = ({ stats, loading, setActiveTab }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
      <div className="p-6 md:p-8 bg-gray-700/30 rounded-xl backdrop-blur-sm border border-gray-600">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Today's Overview</h2>
        <div className="h-64 md:h-80 bg-gray-800/50 rounded-lg flex items-center justify-center">
          {loading ? (
            <div className="animate-pulse text-gray-400">Loading chart...</div>
          ) : (
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-purple-400">
                {Math.floor(stats.totalFocus / 3600)}h
              </div>
              <div className="text-gray-300 mt-2 md:text-lg">Total Focus Today</div>
            </div>
          )}
        </div>
      </div>
      <div className="p-6 md:p-8 bg-gray-700/30 rounded-xl backdrop-blur-sm border border-gray-600">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <button 
            onClick={() => setActiveTab('tasks')}
            className="p-4 md:p-6 bg-purple-600/30 hover:bg-purple-700/30 rounded-xl transition-all flex items-center justify-center gap-2 text-lg md:text-xl"
          >
            <FaPlus className="w-6 h-6" /> Add Task
          </button>
          <button 
            onClick={() => setActiveTab('pomodoro')}
            className="p-4 md:p-6 bg-purple-600/30 hover:bg-purple-700/30 rounded-xl transition-all flex items-center justify-center gap-2 text-lg md:text-xl"
          >
            <FaClock className="w-6 h-6" /> Start Focus
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;