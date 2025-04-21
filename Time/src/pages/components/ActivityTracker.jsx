// ActivityTracker.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';
import { FaChartLine, FaMobileAlt, FaRegClock } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

const ActivityTracker = () => {
  const [activityData, setActivityData] = useState({
    productive: 0,
    social: 0,
    entertainment: 0,
    sleep: 0
  });
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Device detection
  useEffect(() => {
    const mobileCheck = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      .test(navigator.userAgent);
    setIsMobile(mobileCheck);
  }, []);

  // Permission handling
  const requestPermissions = useCallback(async () => {
    try {
      // Mobile-specific permissions
      if (isMobile && 'DeviceOrientationEvent' in window) {
        // @ts-ignore
        const motionStatus = await DeviceOrientationEvent.requestPermission();
        if (motionStatus !== 'granted') throw new Error('Motion access denied');
      }

      // Wake lock
      if ('wakeLock' in navigator) {
        // @ts-ignore
        await navigator.wakeLock.request('screen');
      }

      setPermissionsGranted(true);
      startTracking();
    } catch (error) {
      toast.error(`Permission required: ${error.message}`);
      console.error('Permission error:', error);
    }
  }, [isMobile]);

  // Tracking logic
  const startTracking = useCallback(() => {
    let socialTime = 0;
    let lastActive = Date.now();
    let lastTitle = document.title;

    // Visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        lastActive = Date.now();
      } else {
        const inactiveTime = Math.floor((Date.now() - lastActive) / 60000);
        updateActivity(inactiveTime, document.title);
      }
    };

    // Title change observer (for social media detection)
    const titleObserver = new MutationObserver(() => {
      if (document.title !== lastTitle) {
        if (isSocialMediaTitle(document.title)) {
          socialTime += 1;
        }
        lastTitle = document.title;
      }
    });

    // Update activity data
    const updateActivity = (minutes, title) => {
      setActivityData(prev => ({
        productive: isProductiveTime() ? prev.productive + minutes : prev.productive,
        social: isSocialMediaTitle(title) ? prev.social + minutes : prev.social,
        entertainment: prev.entertainment + minutes,
        sleep: calculateSleepTime() ? prev.sleep + minutes : prev.sleep
      }));
    };

    // Event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    titleObserver.observe(document.querySelector('title'), {
      subtree: true,
      characterData: true,
      childList: true
    });

    // Update every minute
    const interval = setInterval(() => {
      setActivityData(prev => ({
        ...prev,
        sleep: calculateSleepTime() ? prev.sleep + 1 : prev.sleep
      }));
    }, 60000);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      titleObserver.disconnect();
    };
  }, []);

  // Helper functions
  const isSocialMediaTitle = (title) => 
    /Facebook|Instagram|Twitter|TikTok|Reddit/.test(title);

  const isProductiveTime = () => 
    new Date().getHours() >= 9 && new Date().getHours() <= 17;

  const calculateSleepTime = () => {
    const hours = new Date().getHours();
    return hours >= 22 || hours < 6;
  };

  useEffect(() => {
    if (permissionsGranted) {
      return startTracking();
    }
  }, [permissionsGranted, startTracking]);

  // Chart configuration
  const chartData = {
    labels: ['Productive Time', 'Social Media', 'Entertainment', 'Sleep'],
    datasets: [{
      data: [
        activityData.productive,
        activityData.social,
        activityData.entertainment,
        activityData.sleep
      ],
      backgroundColor: [
        '#4ade80',
        '#f87171',
        '#fbbf24',
        '#60a5fa'
      ]
    }]
  };

  return (
    <div className="p-6 bg-gray-800 rounded-xl max-w-3xl mx-auto">
      <h2 className="text-2xl mb-6 flex items-center gap-3">
        <FaChartLine className="text-purple-400" />
        Device Activity Monitor
      </h2>

      {!permissionsGranted && (
        <div className="bg-gray-700 p-6 rounded-lg mb-8">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <FaMobileAlt className="text-purple-400" />
            Required Permissions
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            {isMobile && <li>Device motion sensors (for phone usage detection)</li>}
            <li>Screen wake lock (to monitor in background)</li>
            <li>Page visibility monitoring</li>
          </ul>
          <button
            onClick={requestPermissions}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg
                     transition-all font-medium flex items-center gap-2"
          >
            <FaRegClock className="text-lg" />
            Enable Activity Tracking
          </button>
        </div>
      )}

      {permissionsGranted && (
        <>
          <div className="bg-gray-700/50 p-4 rounded-lg mb-8">
            <Doughnut 
              data={chartData} 
              options={{
                plugins: {
                  legend: { position: 'bottom', labels: { color: '#e5e7eb' } },
                  tooltip: { bodyColor: '#e5e7eb', titleColor: '#d1d5db' }
                }
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(activityData).map(([key, value]) => (
              <div key={key} className="bg-gray-700 p-4 rounded-lg">
                <h3 className="font-medium capitalize mb-2">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="text-3xl font-bold">
                  {Math.floor(value / 60)}h {value % 60}m
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityTracker;