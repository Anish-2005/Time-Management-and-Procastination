import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTasks, FaPlus, FaTrash, FaTimes, FaSave,FaCheck,FaFire } from 'react-icons/fa';
import { toast } from 'react-toastify';

const taskVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const TaskManager = ({
  tasks,
  loading,
  addTask,
  toggleTask,
  deleteTask
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [importance, setImportance] = useState(50);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) {
      toast.error('Task title is required');
      return;
    }

    try {
      await addTask({
        title: newTask,
        description: newDescription,
        importance
      });
      setNewTask('');
      setNewDescription('');
      setImportance(50);
      setShowAddForm(false);
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setNewTask('');
    setNewDescription('');
    setImportance(50);
  };


  
  return (
    <div>
      {/* Desktop Layout - Original Version */}
      <div className="hidden md:block p-8 max-w-6xl mx-auto my-12 w-full md:w-5/6 lg:w-4/5 xl:w-3/4 min-w-[800px]">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold flex items-center gap-3 text-purple-400 pb-8">
            <FaTasks className="w-7 h-7" />
            Task Manager
          </h2>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-xl
                        flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <FaPlus className="text-lg" />
              <span className="font-semibold">Add Task</span>
            </button>
          )}
        </div>

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <form onSubmit={handleSubmit} className="space-y-6 bg-gray-700/50 p-6 rounded-2xl backdrop-blur-sm border border-gray-600">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-100">Create New Task</h3>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Enter task title"
                    className="w-full px-4 py-3 bg-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Add detailed description..."
                    className="w-full px-4 py-3 bg-gray-600/50 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-400"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Priority Level: <span className="text-purple-400">{importance}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={importance}
                      onChange={(e) => setImportance(parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-600 rounded-full appearance-none cursor-pointer range-thumb"
                    />
                    <div className="flex justify-between text-sm text-gray-400 mt-2">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-4 rounded-xl
                            flex-1 flex items-center justify-center gap-2 font-semibold transition-all transform hover:scale-105"
                  disabled={loading.tasks}
                >
                  <FaSave className="w-5 h-5" />
                  {loading.tasks ? 'Saving...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-600/50 hover:bg-gray-500/50 px-8 py-4 rounded-xl
                            flex-1 flex items-center justify-center gap-2 font-semibold transition-all transform hover:scale-105"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="space-y-5">
          {tasks
            .sort((a, b) => b.importance - a.importance)
            .map(task => (
              <motion.div
                key={task._id}
                variants={taskVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover={{ scale: 1.02 }}
                className={`p-5 bg-gradient-to-r ${task.completed ? 'from-gray-700/50 to-gray-600/50' : 'from-gray-700 to-gray-600'} rounded-xl shadow-md border ${task.completed ? 'border-gray-600' : 'border-gray-700'} transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleTask(task._id, task.completed)}
                        className={`mt-1 p-2 rounded-lg ${task.completed ? 'bg-green-500/20 border border-green-500/30' : 'bg-gray-600/50 border border-gray-500/30'} hover:bg-gray-500/30 transition-colors`}
                        disabled={loading.tasks}
                      >
                        <FaCheck className={`w-5 h-5 ${task.completed ? 'text-green-400' : 'text-gray-400'}`} />
                      </button>
                      
                      <div className="flex-1">
                        <h3 className={`text-lg font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-gray-100'}`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm bg-gray-700/50 px-3 py-1 rounded-full">
                            <FaFire className={`w-4 h-4 ${task.importance > 70 ? 'text-red-400' : task.importance > 40 ? 'text-yellow-400' : 'text-blue-400'}`} />
                            <span className={`font-medium ${task.importance > 70 ? 'text-red-300' : task.importance > 40 ? 'text-yellow-300' : 'text-blue-300'}`}>
                              {task.importance} Priority
                            </span>
                          </div>
                          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                              style={{ width: `${task.importance}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="ml-4 p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
                    disabled={loading.tasks}
                  >
                    <FaTrash className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                  </button>
                </div>
              </motion.div>
            ))}
          
          {tasks.length === 0 && !loading.tasks && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="mb-4 text-6xl text-gray-500">
                <FaTasks />
              </div>
              <p className="text-gray-400 text-lg">
                No tasks found. Click "Add Task" to get started!
              </p>
            </motion.div>
          )}
          
          {loading.tasks && (
            <div className="text-center py-8 space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="p-5 bg-gray-700/50 rounded-xl animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-6 h-6 bg-gray-600 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-600 rounded w-3/4" />
                      <div className="h-3 bg-gray-600 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

<div className="md:hidden p-4 mx-auto w-full max-w-[100vw]">
  <div className="bg-gray-800 rounded-xl shadow-lg p-4">
    {/* Header Section */}
    <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
      <h2 className="text-xl font-bold flex items-center gap-2 text-purple-300 mr-2">
        <FaTasks className="w-6 h-6 text-purple-400" />
        <span>Task Manager</span>
      </h2>
      {!showAddForm && (
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-xl 
                    flex items-center gap-2 active:scale-95 transition-all"
        >
          <FaPlus className="text-base" />
          <span className="text-sm font-medium">New Task</span>
        </button>
      )}
    </div>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <form onSubmit={handleSubmit} className="space-y-4 bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-gray-100">New Task</h3>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Task title"
                    className="w-full px-3 py-2 bg-gray-600/50 rounded-lg text-sm"
                    autoFocus
                  />
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 bg-gray-600/50 rounded-lg text-sm"
                    rows="2"
                  />
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">
                      Priority: <span className="text-purple-400">{importance}</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={importance}
                      onChange={(e) => setImportance(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-full"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-lg flex-1 text-sm"
                  >
                    {loading.tasks ? 'Saving...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="bg-gray-600/50 px-4 py-2 rounded-lg flex-1 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="space-y-3">
            {tasks.sort((a, b) => b.importance - a.importance).map(task => (
              <div key={task._id} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <button
                      onClick={() => toggleTask(task._id, task.completed)}
                      className={`mt-1 p-1.5 rounded-md ${task.completed ? 'bg-green-500/20' : 'bg-gray-600/50'}`}
                    >
                      <FaCheck className={`w-4 h-4 ${task.completed ? 'text-green-400' : 'text-gray-400'}`} />
                    </button>
                    <div className="flex-1">
                      <h3 className={`text-sm ${task.completed ? 'text-gray-400 line-through' : 'text-gray-100'}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-1">{task.description}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs bg-gray-600/50 px-2 py-1 rounded-full">
                          <FaFire className={`w-3 h-3 ${task.importance > 70 ? 'text-red-400' : task.importance > 40 ? 'text-yellow-400' : 'text-blue-400'}`} />
                          <span>{task.importance} Priority</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="p-1.5 hover:bg-red-500/20 rounded-md"
                  >
                    <FaTrash className="w-4 h-4 text-red-400" />
                  </button>
                </div>
                <div className="mt-2 h-1.5 bg-gray-600 rounded-full">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                    style={{ width: `${task.importance}%` }}
                  />
                </div>
              </div>
            ))}

            {tasks.length === 0 && !loading.tasks && (
              <div className="text-center py-6">
                <div className="mb-2 text-4xl text-gray-500">
                  <FaTasks />
                </div>
                <p className="text-gray-400 text-sm">
                  No tasks found. Tap "Add" to begin!
                </p>
              </div>
            )}

            {loading.tasks && (
              <div className="space-y-2">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="p-3 bg-gray-700/50 rounded-lg animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-600 rounded-md" />
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-gray-600 rounded w-3/4" />
                        <div className="h-2 bg-gray-600 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskManager;