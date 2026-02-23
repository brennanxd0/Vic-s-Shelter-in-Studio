
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Adopt from './pages/Adopt';
import Volunteer from './pages/Volunteer';
import Donate from './pages/Donate';
import Auth from './pages/Auth';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import { auth, isFirebaseConfigured } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchAnimals, fetchApplications, seedInitialData, getUserProfile } from './services/firebaseService';
import { User as AppUser, Animal, AdoptionApplication } from './types';

const App: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        await seedInitialData();
        
        const [animalsData, appsData] = await Promise.all([
          fetchAnimals(),
          fetchApplications()
        ]);
        
        setAnimals(animalsData);
        setApplications(appsData);
      } catch (error) {
        console.error("Error initializing app with Firebase:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    initApp();
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Connecting to Vic's Shelter...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adopt" element={<Adopt animals={animals} />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={
            (userProfile?.role === 'admin' || userProfile?.role === 'staff') ? (
              <AdminDashboard 
                animals={animals} 
                setAnimals={setAnimals} 
                applications={applications}
                setApplications={setApplications}
              />
            ) : (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
                  <p className="text-slate-500 mb-6">You don't have permission to view this page.</p>
                  <Link to="/" className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold">Return Home</Link>
                </div>
              </div>
            )
          } />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
