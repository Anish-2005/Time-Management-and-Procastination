import React, { useEffect, useState } from 'react';
import { FaBell } from 'react-icons/fa';

const ReminderManager = ({ tasks, loading }) => {
  // Compute next notification time for a task using the stored lastNotified timestamp.
  const computeNextNotification = (taskId) => {
    const lastNotified = localStorage.getItem(`lastNotified_${taskId}`);
    const lastTime = lastNotified ? parseInt(lastNotified, 10) : 0;
    return lastTime ? lastTime + 3 * 60 * 60 * 1000 : Date.now();
  };

  // Request Notification permission on mount.
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // When tasks update (and not loading), initialize notification times for new pending tasks.
  useEffect(() => {
    if (!loading) {
      tasks.forEach(task => {
        if (!task.completed) {
          if (!localStorage.getItem(`lastNotified_${task._id}`)) {
            // Initialize the notification time to now (immediate notification)
            localStorage.setItem(`lastNotified_${task._id}`, Date.now());
          }
        } else {
          // Clean up completed tasks from storage.
          localStorage.removeItem(`lastNotified_${task._id}`);
        }
      });
    }
  }, [tasks, loading]);

  // Check every minute if it's time to send a notification.
  useEffect(() => {
    const checkNotifications = () => {
      const now = Date.now();

      tasks.forEach(task => {
        if (!task.completed) {
          const lastNotified = localStorage.getItem(`lastNotified_${task._id}`) || 0;
          const nextTime = lastNotified ? parseInt(lastNotified, 10) + 3 * 60 * 60 * 1000 : now;
          if (now >= nextTime) {
            if (Notification.permission === 'granted') {
              new Notification('Task Reminder', { 
                body: `Reminder: ${task.title}` // Changed from text to title
              });
            }
            // Update the lastNotified to now.
            localStorage.setItem(`lastNotified_${task._id}`, now);
          }
        }
      });
    };

    const interval = setInterval(checkNotifications, 60 * 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  return (
    <div>
      {/* Desktop Layout */}
      <div className="hidden md:block p-8 max-w-7xl mx-auto">
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-600/50 shadow-2xl">
          <div className="p-6 border-b border-gray-600/50">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <FaBell className="w-7 h-7 text-purple-400 animate-pulse" />
              Task Reminders
              <span className="text-purple-400 text-sm font-medium bg-gray-900/50 px-3 py-1 rounded-full">
                {tasks.filter(task => !task.completed).length} Pending
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-8 grid grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="p-4 bg-gray-700/30 rounded-xl animate-pulse">
                  <div className="h-5 bg-gray-600 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-600 rounded w-1/2 mb-4" />
                  <div className="h-3 bg-gray-600 rounded w-full" />
                </div>
              ))}
            </div>
          ) : tasks.filter(task => !task.completed).length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-block bg-gray-700/30 p-6 rounded-2xl">
                <FaBell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 text-lg font-medium">
                  All caught up! No pending reminders.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 p-8">
              {tasks.filter(task => !task.completed).map(task => {
                const nextNotificationTime = computeNextNotification(task._id);
                const timeUntilNotification = nextNotificationTime - Date.now();
                const progress = Math.min(Math.max(1 - (timeUntilNotification / (3 * 60 * 60 * 1000), 0) * 100, 100));

                return (
                  <div
                    key={task._id}
                    className="group bg-gray-800/50 hover:bg-gray-800/70 rounded-xl border border-gray-600/30 transition-all duration-300 ease-in-out"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">{task.title}</h3>
                          {task.dueDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <span className="bg-purple-400/10 text-purple-400 px-2 py-1 rounded-md mr-8">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400 mb-1">Next Alert</div>
                          <div className="text-lg font-medium text-purple-400">
                            {new Date(nextNotificationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div className="relative pt-4">
                        <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          {progress === 100 ? 'Ready for next notification' : 
                          `Next notification in ${Math.floor(timeUntilNotification / (60 * 60 * 1000))}h ${
                            Math.floor((timeUntilNotification % (60 * 60 * 1000)) / (60 * 1000))
                          }m`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden p-4">
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-600/50 shadow-lg">
          <div className="p-4 border-b border-gray-600/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FaBell className="w-5 h-5 text-purple-400 animate-pulse" />
              Reminders
              <span className="text-purple-400 text-xs font-medium bg-gray-900/50 px-2 py-1 rounded-full">
                {tasks.filter(task => !task.completed).length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="p-3 bg-gray-700/30 rounded-lg animate-pulse">
                  <div className="h-4 bg-gray-600 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-600 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : tasks.filter(task => !task.completed).length === 0 ? (
            <div className="p-6 text-center">
              <FaBell className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">
                All reminders completed
              </p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {tasks.filter(task => !task.completed).map(task => {
                const nextNotificationTime = computeNextNotification(task._id);
                const timeUntilNotification = nextNotificationTime - Date.now();
                const progress = Math.min(Math.max(1 - (timeUntilNotification / (3 * 60 * 60 * 1000)), 0) * 100, 100);

                return (
                  <div
                    key={task._id}
                    className="bg-gray-800/50 rounded-lg border border-gray-600/30 p-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-white text-sm mb-1">{task.title}</h3>
                        {task.dueDate && (
                          <div className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-md inline-block">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="text-right pl-2">
                        <div className="text-xs text-gray-400">Next</div>
                        <div className="text-sm font-medium text-purple-400">
                          {new Date(nextNotificationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="text-2xs text-gray-400 mt-1">
                        {progress === 100 ? 'Notification ready' : 
                        `Next in ${Math.floor(timeUntilNotification / (60 * 60 * 1000))}h ${
                          Math.floor((timeUntilNotification % (60 * 60 * 1000)) / (60 * 1000))
                        }m`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderManager;