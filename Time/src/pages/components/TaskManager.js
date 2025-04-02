import React from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const TaskManager = ({ tasks, newTask, setNewTask, addTask, toggleTask, deleteTask, loading }) => {
  const taskVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-700/30 rounded-xl backdrop-blur-sm border border-gray-600">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8">Task Management</h2>
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add new task..."
          className="flex-1 p-3 md:p-4 bg-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        <button 
          onClick={addTask}
          className="bg-purple-600 hover:bg-purple-700 px-6 md:px-8 py-3 md:py-4 rounded-lg flex items-center justify-center gap-2 transition-all text-lg"
        >
          <FaPlus className="w-5 h-5 md:w-6 md:h-6" /> Add
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-800/50 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <AnimatePresence>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-lg">
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
                  className="p-4 md:p-5 bg-gray-800/50 rounded-lg flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task._id, task.completed)}
                      className="w-6 h-6 accent-purple-400 cursor-pointer"
                    />
                    <span className={`flex-1 text-lg ${task.completed ? 'line-through text-gray-400' : ''}`}>
                      {task.text}
                    </span>
                    <span className="text-sm md:text-base text-gray-400">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  >
                    <FaTrash className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default TaskManager;