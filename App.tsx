
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import Adopt from './pages/Adopt';
import Volunteer from './pages/Volunteer';
import Donate from './pages/Donate';
import Auth from './pages/Auth';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import { auth, isFirebaseConfigured } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { fetchAnimals, fetchApplications, getUserProfile, createUserProfile } from './services/firebaseService';
import { User as AppUser, Animal, AdoptionApplication } from './types';

const App: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      try {
        const animalsData = await fetchAnimals();
        setAnimals(animalsData);
      } catch (error) {
        console.error("Error initializing app with Firebase:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        let profile = await getUserProfile(currentUser.uid);
        
        // Auto-promote specific user to admin for setup
        if (currentUser.email === 'brennanxd0@gmail.com') {
          if (!profile || profile.role !== 'admin') {
            console.log("Ensuring setup user has admin role...");
            // Use setDoc via createUserProfile to ensure doc exists and has admin role
            const adminData = {
              name: currentUser.displayName || 'Admin Setup',
              email: currentUser.email,
              role: 'admin' as const
            };
            await createUserProfile(currentUser.uid, adminData);
            profile = { id: currentUser.uid, ...adminData, createdAt: new Date().toISOString() };
          }
        }
        
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    initApp();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadSensitiveData = async () => {
      if (userProfile?.role === 'admin' || userProfile?.role === 'staff') {
        try {
          const appsData = await fetchApplications();
          setApplications(appsData);
        } catch (error) {
          console.error("Error fetching applications:", error);
        }
      }
    };
    loadSensitiveData();
  }, [userProfile]);

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
      <Toaster position="top-right" richColors />
      <Layout user={user} profile={userProfile}>
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
