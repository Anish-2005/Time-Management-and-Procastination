import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { FaGoogle, FaClock, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

const LandingPage = () => {
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();

 
const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      navigate('/app'); // Add this line
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign-Out Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100">
      {/* Navigation */}
      <nav className="px-6 py-4 border-b border-gray-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-400">ChronoMaster</h1>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-300">Welcome, {user.displayName}</span>
              <button 
                onClick={handleSignOut}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={handleGoogleSignIn}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all"
            >
              <FaGoogle /> Continue with Google
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Take Control of Your Time, 
            <span className="text-purple-400"> Conquer Procrastination</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Transform your productivity with smart task management, progress tracking, 
            and personalized insights.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-6 bg-gray-800/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-gray-700/30 rounded-xl backdrop-blur-sm border border-gray-600">
            <FaClock className="text-4xl text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Time Tracking</h3>
            <p className="text-gray-300">
              Automatically track your activities and analyze where your time goes.
            </p>
          </div>

          <div className="p-6 bg-gray-700/30 rounded-xl backdrop-blur-sm border border-gray-600">
            <FaCalendarAlt className="text-4xl text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Task Management</h3>
            <p className="text-gray-300">
              Organize tasks with deadlines, priorities, and progress tracking.
            </p>
          </div>

          <div className="p-6 bg-gray-700/30 rounded-xl backdrop-blur-sm border border-gray-600">
            <FaChartLine className="text-4xl text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Productivity Insights</h3>
            <p className="text-gray-300">
              Get detailed reports and personalized improvement suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Productivity?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join thousands who've already mastered their time management
          </p>
          {!user && (
            <button
              onClick={handleGoogleSignIn}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-2 mx-auto transition-all"
            >
              <FaGoogle /> Get Started Now
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;