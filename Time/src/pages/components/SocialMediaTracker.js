// SocialMediaTracker.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { auth } from './firebase';
import { FaMobileAlt, FaHashtag } from 'react-icons/fa';

const SocialMediaTracker = () => {
  const [usageData, setUsageData] = useState([]);
  const [limits, setLimits] = useState({
    facebook: 60,
    instagram: 60,
    twitter: 45
  });

  const checkForUsage = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/social-usage`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsageData(data);
      
      // Check limits
      data.forEach(app => {
        if (app.usage > limits[app.name.toLowerCase()]) {
          toast.warning(`You've exceeded ${app.name} limit!`, {
            autoClose: false,
            closeOnClick: false
          });
        }
      });
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  useEffect(() => {
    checkForUsage();
    const interval = setInterval(checkForUsage, 300000); // Check every 5 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-gray-800 rounded-xl">
      <h2 className="text-2xl mb-4 flex items-center gap-2">
        <FaMobileAlt className="text-purple-400" /> App Usage Tracker
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {usageData.map(app => (
          <div key={app.name} className="p-4 bg-gray-700 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-xl">{app.name}</h3>
              <span className="text-purple-400">
                {Math.floor(app.usage / 60)}h {app.usage % 60}m
              </span>
            </div>
            <div className="mt-2 relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs">
                    {Math.min(app.usage, limits[app.name.toLowerCase()])} / {limits[app.name.toLowerCase()]} mins
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-800">
                <div
                  style={{ width: `${Math.min((app.usage / limits[app.name.toLowerCase()]) * 100, 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default SocialMediaTracker