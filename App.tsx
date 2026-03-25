
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import Adopt from './pages/Adopt';
import Volunteer from './pages/Volunteer';
import Donate from './pages/Donate';
import Auth from './pages/Auth';
import Register from './pages/Register';
import Foster from './pages/Foster';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import { auth, isFirebaseConfigured } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';
import { fetchAnimals, fetchApplications, getUserProfile, syncUserProfile } from './services/firebaseService';
import { User as AppUser, Animal, AdoptionApplication } from './types';

const App: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileListener, setProfileListener] = useState<(() => void) | null>(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        // Automatically sign out on reload as requested
        if (isFirebaseConfigured) {
          await signOut(auth);
        }
        const animalsData = await fetchAnimals();
        setAnimals(animalsData);
      } catch (error) {
        console.error("Error initializing app with Firebase:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      console.log("[DEBUG] Auth state changed:", currentUser?.email || "No user");
      
      // Clean up existing profile listener if any
      if (profileListener) {
        profileListener();
        setProfileListener(null);
      }

      setUser(currentUser);
      
      if (currentUser) {
        setLoadingProfile(true);
        // Initial profile fetch and sync (Secure RBAC)
        try {
          const profile = await syncUserProfile();
          setUserProfile(profile);
          setLoadingProfile(false);

          // Listen for real-time profile updates
          const profileRef = doc(db, 'users', currentUser.uid);
          const unsubscribeProfile = onSnapshot(profileRef, 
            async (docSnap) => {
              if (docSnap.exists()) {
                const newProfile = { id: docSnap.id, ...docSnap.data() } as AppUser;
                
                // If role changed, refresh ID token to update custom claims
                if (userProfile && newProfile.role !== userProfile.role) {
                  console.log(`[DEBUG] Role updated from ${userProfile.role} to ${newProfile.role}. Refreshing token...`);
                  await currentUser.getIdToken(true);
                  toast.success(`Your access level has been updated to: ${newProfile.role}`, {
                    description: "New permissions are now active."
                  });
                }
                
                setUserProfile(newProfile);
              }
            },
            (error) => {
              // Handle permission errors gracefully (e.g. on sign out)
              if (error.code === 'permission-denied') {
                console.log("[DEBUG] Profile listener permission revoked (expected on sign-out)");
              } else {
                console.error("Profile listener error:", error);
              }
            }
          );

          setProfileListener(() => unsubscribeProfile);
        } catch (err) {
          console.error("Error setting up user profile:", err);
          setLoadingProfile(false);
        }
      } else {
        setUserProfile(null);
        setLoadingProfile(false);
      }
    });

    initApp();
    return () => {
      unsubscribeAuth();
      if (profileListener) profileListener();
    };
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

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            {loading ? "Connecting to Vic's Shelter..." : "Verifying permissions..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Toaster position="top-right" richColors closeButton />
      <Layout user={user} profile={userProfile}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adopt" element={<Adopt animals={animals} user={user} />} />
          <Route path="/foster" element={<Foster animals={animals} user={user} />} />
          <Route path="/volunteer" element={<Volunteer user={user} profile={userProfile} />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile user={user} profile={userProfile} />} />
          <Route path="/admin" element={
            (userProfile?.role === 'admin' || userProfile?.role === 'staff') ? (
              <AdminDashboard 
                animals={animals} 
                setAnimals={setAnimals} 
                applications={applications}
                setApplications={setApplications}
                profile={userProfile}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
