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
              new Notification('Task Reminder', { body: `Reminder: ${task.text}` });
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
    <div className="p-6 bg-gray-700/30 rounded-xl backdrop-blur-sm border border-gray-600 shadow-lg max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-2">
        <FaBell className="w-8 h-8 text-purple-400" /> Reminders
      </h2>
      {loading ? (
        <p className="text-gray-300 text-lg text-center py-8">Loading reminders...</p>
      ) : tasks.filter(task => !task.completed).length === 0 ? (
        <p className="text-gray-300 text-lg text-center py-8">No pending reminders.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks
            .filter(task => !task.completed)
            .map(task => {
              const nextNotificationTime = computeNextNotification(task._id);
              return (
                <div
                  key={task._id}
                  className="p-4 bg-gray-800/70 rounded-lg flex flex-col justify-between"

                >
                  <div>
                    <h3 className="text-xl font-semibold text-white">{task.text}</h3>
                    {task.dueDate && (
                      <p className="text-sm text-gray-400">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right mt-4">
                    <p className="text-sm text-gray-400">Next Notification:</p>
                    <p className="text-lg font-medium text-white">
                      {new Date(nextNotificationTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default ReminderManager;
