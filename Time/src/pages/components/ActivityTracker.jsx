import React, { useEffect, useState, useCallback } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { toast } from 'react-toastify';
import { FaChartLine, FaMobileAlt, FaRegClock, FaPowerOff, FaList } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

const STORAGE_KEY = 'windowActivityData';
const PERMISSION_KEY = 'windowTrackingEnabled';

const siteCategories = {
  productive: [
    /docs\.google/, /notion\.so/, /trello/, /asana/, /github/, /gitlab/,
    /stackoverflow/, /figma/, /slack/, /microsoft/, /atlassian/, /zoom/,
    /webex/, /grammarly/, /codepen/, /replit/, /overleaf/, /gmail/,
    /outlook/, /calendar\.google/, /jira/, /confluence/
  ],
  social: [
    /facebook/, /twitter/, /instagram/, /linkedin/, /pinterest/,
    /tiktok/, /reddit/, /snapchat/, /whatsapp/, /telegram/, /discord/,
    /tumblr/, /vk/, /wechat/, /line/, /signal/, /threads/
  ],
  entertainment: [
    /youtube/, /netflix/, /twitch/, /spotify/, /primevideo/,
    /hulu/, /disneyplus/, /soundcloud/, /vimeo/, /dailymotion/,
    /9gag/, /bilibili/, /crunchyroll/, /funimation/, /deviantart/,
    /steam/, /epicgames/, /origin/, /xbox/
  ]
};

const classifyWebsite = (url) => {
  for (const [category, patterns] of Object.entries(siteCategories)) {
    if (patterns.some(pattern => pattern.test(url))) {
      return category;
    }
  }
  return 'other';
};

const ActivityTracker = () => {
  const [trackingData, setTrackingData] = useState({
    activeTime: 0,
    byCategory: { productive: 0, social: 0, entertainment: 0, other: 0 },
    byDomain: {},
    windowSwitches: 0,
    lastActiveTab: null
  });

  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [currentActivity, setCurrentActivity] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  // Load/save data
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) setTrackingData(JSON.parse(savedData));
    if (localStorage.getItem(PERMISSION_KEY)) setPermissionsGranted(true);
  }, []);

  useEffect(() => {
    if (permissionsGranted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trackingData));
    }
  }, [trackingData, permissionsGranted]);

  // Activity detection
  const updateActivity = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - lastInteraction) / 1000;
    const isActive = document.visibilityState === 'visible';
    const url = new URL(window.location.href);
    const domain = url.hostname.replace('www.', '');
    const category = classifyWebsite(domain);

    if (isActive && elapsed < 300) { // 5 minute idle threshold
      setTrackingData(prev => ({
        ...prev,
        activeTime: prev.activeTime + elapsed,
        byCategory: {
          ...prev.byCategory,
          [category]: prev.byCategory[category] + elapsed
        },
        byDomain: {
          ...prev.byDomain,
          [domain]: (prev.byDomain[domain] || 0) + elapsed
        },
        lastActiveTab: domain
      }));

      setCurrentActivity({
        domain,
        category,
        startTime: lastInteraction,
        endTime: now
      });
    }

    setLastInteraction(now);
  }, [lastInteraction]);

  // Interaction listeners
  useEffect(() => {
    if (!permissionsGranted) return;

    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    const handleInteraction = () => setLastInteraction(Date.now());

    events.forEach(event => window.addEventListener(event, handleInteraction));
    return () => events.forEach(event => 
      window.removeEventListener(event, handleInteraction)
    );
  }, [permissionsGranted]);

  // Visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      setTrackingData(prev => ({
        ...prev,
        windowSwitches: prev.windowSwitches + 1
      }));
      setLastInteraction(Date.now());
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Main tracking loop
  useEffect(() => {
    if (!permissionsGranted) return;

    const interval = setInterval(() => {
      updateActivity();
    }, 1000);

    return () => clearInterval(interval);
  }, [permissionsGranted, updateActivity]);

  // Control functions
  const enableTracking = () => {
    setPermissionsGranted(true);
    localStorage.setItem(PERMISSION_KEY, 'true');
    toast.success('Window activity tracking enabled!');
  };

  const disableTracking = () => {
    setPermissionsGranted(false);
    localStorage.removeItem(PERMISSION_KEY);
    toast.info('Tracking stopped and data cleared');
    setTrackingData({
      activeTime: 0,
      byCategory: { productive: 0, social: 0, entertainment: 0, other: 0 },
      byDomain: {},
      windowSwitches: 0,
      lastActiveTab: null
    });
  };

  // Chart configuration
  const chartData = {
    labels: ['Productive', 'Social', 'Entertainment', 'Other'],
    datasets: [{
      data: Object.values(trackingData.byCategory),
      backgroundColor: ['#4ade80', '#f87171', '#fbbf24', '#60a5fa']
    }]
  };

  // Detailed report component
  const DetailedReport = () => (
    <div className="bg-gray-700 p-4 rounded-lg mt-4">
      <h3 className="text-lg mb-4 flex items-center gap-2">
        <FaList className="text-blue-400" />
        Window Activity Details
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Most Active Tabs</h4>
          {Object.entries(trackingData.byDomain)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([domain, time]) => (
              <div key={domain} className="flex justify-between p-2 even:bg-gray-600">
                <span>{domain}</span>
                <span>{Math.floor(time / 3600)}h {Math.floor((time % 3600) / 60)}m</span>
              </div>
            ))}
        </div>
        <div>
          <h4 className="font-medium mb-2">Activity Stats</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Active Time:</span>
              <span>{Math.floor(trackingData.activeTime / 3600)}h</span>
            </div>
            <div className="flex justify-between">
              <span>Window Switches:</span>
              <span>{trackingData.windowSwitches}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Tab:</span>
              <span>{currentActivity.domain || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-gray-800 rounded-xl max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl flex items-center gap-3">
          <FaChartLine className="text-purple-400" />
          Window & Tab Activity Monitor
        </h2>
        {permissionsGranted && (
          <div className="flex gap-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-all"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            <button
              onClick={disableTracking}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all flex items-center gap-2"
            >
              <FaPowerOff />
              Stop Tracking
            </button>
          </div>
        )}
      </div>

      {!permissionsGranted ? (
        <div className="bg-gray-700 p-6 rounded-lg mb-8">
          <h3 className="text-lg mb-4 flex items-center gap-2">
            <FaMobileAlt className="text-purple-400" />
            Cross-Tab Monitoring
          </h3>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li>Real-time window focus tracking</li>
            <li>Browser tab activity monitoring</li>
            <li>User interaction detection</li>
            <li>Domain-level time tracking</li>
          </ul>
          <button
            onClick={enableTracking}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg transition-all font-medium flex items-center gap-2"
          >
            <FaRegClock className="text-lg" />
            Enable Window Tracking
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-gray-700/50 p-4 rounded-lg">
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
            
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg mb-4">Current Window Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 bg-gray-600 rounded">
                  <span>Active Domain:</span>
                  <span className="font-mono">{currentActivity.domain || 'N/A'}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 bg-gray-600 rounded text-center">
                    <div className="text-sm text-gray-300">Current Category</div>
                    <div className="text-xl font-bold capitalize">
                      {currentActivity.category || 'unknown'}
                    </div>
                  </div>
                  <div className="p-2 bg-gray-600 rounded text-center">
                    <div className="text-sm text-gray-300">Active Time</div>
                    <div className="text-xl font-bold">
                      {Math.floor(trackingData.activeTime / 3600)}h 
                      {Math.floor((trackingData.activeTime % 3600) / 60)}m
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showDetails && <DetailedReport />}
        </>
      )}
    </div>
  );
};

export default ActivityTracker;