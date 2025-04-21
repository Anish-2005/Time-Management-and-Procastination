import React from 'react';
import { FaChartPie, FaTasks, FaClock, FaPlus, FaTrophy, FaCheckCircle, FaRegClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Dashboard = ({ stats, loading, setActiveTab }) => {
  const StatCard = ({ icon, value, label, color }) => (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-4 bg-gray-800/40 rounded-xl border border-purple-500/20 backdrop-blur-lg"
    >
      <div className={`flex items-center gap-4 text-${color}-400`}>
        <div className="p-2 bg-purple-500/10 rounded-lg border border-purple-500/20">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-gray-400">{label}</div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          icon={<FaRegClock className="w-6 h-6" />}
          value={`${Math.floor(stats.totalFocus / 3600)}h ${Math.floor((stats.totalFocus % 3600) / 60)}m`}
          label="Total Focus"
          color="purple"
        />
        <StatCard
          icon={<FaCheckCircle className="w-6 h-6" />}
          value={stats.tasksCompleted}
          label="Tasks Completed"
          color="green"
        />
        <StatCard
          icon={<FaTrophy className="w-6 h-6" />}
          value={`${stats.currentStreak} days`}
          label="Current Streak"
          color="yellow"
        />
      </div>

      {/* Focus Visualization */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-purple-900/30 to-gray-800/50 rounded-2xl border border-purple-400/20 backdrop-blur-lg">
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-300 to-indigo-300 bg-clip-text text-transparent mb-6">
          <FaChartPie className="inline mr-2 w-6 h-6" />
          Productivity Breakdown
        </h2>
        <div className="h-64 md:h-96 bg-gray-800/20 rounded-xl flex items-center justify-center">
          {loading ? (
            <div className="animate-pulse text-gray-400">Analyizing productivity patterns...</div>
          ) : (
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-purple-300">
                {Math.floor((stats.tasksCompleted / (stats.tasksCompleted + 5)) * 100)}%
              </div>
              <div className="text-gray-300 md:text-lg">Daily Goal Progress</div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('tasks')}
          className="p-6 md:p-8 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 rounded-2xl border border-purple-500/30 backdrop-blur-lg flex items-center gap-4 group"
        >
          <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30 group-hover:bg-purple-500/30 transition-all">
            <FaPlus className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-left">
            <div className="text-lg md:text-xl font-semibold text-purple-300">Add New Task</div>
            <div className="text-sm text-gray-400">Start organizing your day</div>
          </div>
        </motion.button>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('pomodoro')}
          className="p-6 md:p-8 bg-gradient-to-br from-purple-600/30 to-indigo-600/30 rounded-2xl border border-purple-500/30 backdrop-blur-lg flex items-center gap-4 group"
        >
          <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30 group-hover:bg-purple-500/30 transition-all">
            <FaClock className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-left">
            <div className="text-lg md:text-xl font-semibold text-purple-300">Start Focus Session</div>
            <div className="text-sm text-gray-400">Deep work starts now</div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default Dashboard;