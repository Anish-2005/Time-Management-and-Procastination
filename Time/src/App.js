import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LandingPage from './pages/Landing';
import HomePage from './pages/Home';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check local storage first
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        localStorage.setItem('isLoggedIn', 'true');
        if (window.location.pathname === '/') navigate('/app');
      } else {
        setUser(null);
        localStorage.removeItem('isLoggedIn');
        if (window.location.pathname === '/app') navigate('/');
      }
      setLoading(false);
    });

    // Initial navigation based on local storage
    if (isLoggedIn && window.location.pathname === '/') {
      navigate('/app');
    }

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-purple-400 text-2xl">Loading...</div>
    </div>;
  }

  return (
    <>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/app" /> : <LandingPage />} 
        />
        <Route 
          path="/app" 
          element={user ? <HomePage /> : <Navigate to="/" />} 
        />
      </Routes>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="dark"
      />
    </>
  );
}

export default App;