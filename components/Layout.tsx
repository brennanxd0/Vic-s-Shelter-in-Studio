
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { getUserProfile } from '../services/firebaseService';
import { User as AppUser } from '../types';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const location = useLocation();

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userProfile = await getUserProfile(currentUser.uid);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    if (!isFirebaseConfigured) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  const isActive = (path: string) => location.hash === path || (location.hash === '' && path === '#/');

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-purple-600 p-1.5 rounded-lg shadow-lg shadow-purple-100">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708a2 2 0 011.965 2.388l-1.01 4.542a2 2 0 01-1.965 1.57H4.302a2 2 0 01-1.965-1.57l-1.01-4.542A2 2 0 013.292 10H8m6 0v2a2 2 0 11-4 0v-2m4 0V5a2 2 0 10-4 0v5" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">Vic's Animal Shelter</span>
            </Link>
            
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/" className={`text-sm font-medium transition-colors ${isActive('#/') ? 'text-purple-600' : 'text-slate-600 hover:text-purple-600'}`}>Home</Link>
              <Link to="/adopt" className={`text-sm font-medium transition-colors ${isActive('#/adopt') ? 'text-purple-600' : 'text-slate-600 hover:text-purple-600'}`}>Adopt</Link>
              <Link to="/volunteer" className={`text-sm font-medium transition-colors ${isActive('#/volunteer') ? 'text-purple-600' : 'text-slate-600 hover:text-purple-600'}`}>Volunteer</Link>
              <Link to="/donate" className={`text-sm font-medium transition-colors ${isActive('#/donate') ? 'text-purple-600' : 'text-slate-600 hover:text-purple-600'}`}>Donate</Link>
              {(profile?.role === 'admin' || profile?.role === 'staff') && (
                <Link to="/admin" className={`text-sm font-medium px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 transition-all ${isActive('#/admin') ? 'text-purple-600 border-purple-100 bg-purple-50' : 'text-slate-400 hover:text-slate-600'}`}>Admin</Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Welcome</div>
                    <div className="text-sm font-bold text-slate-800">{user.displayName || user.email}</div>
                  </div>
                  <button 
                    onClick={handleSignOut}
                    className="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <Link to="/auth" className="text-sm font-semibold text-slate-700 hover:text-purple-600 transition-colors">Sign In</Link>
                  <Link to="/register" className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-md shadow-purple-100 hover:bg-purple-700 transition-all">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white text-lg font-bold mb-4 italic">Vic's Animal Shelter</h3>
            <p className="max-w-sm text-slate-400">Dedicated to finding forever homes for animals in need. Join us in making a difference in the lives of our furry friends.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/adopt" className="hover:text-purple-400 transition-colors">Adoption Process</Link></li>
              <li><Link to="/volunteer" className="hover:text-purple-400 transition-colors">Volunteer Opportunities</Link></li>
              <li><Link to="/donate" className="hover:text-purple-400 transition-colors">Monthly Giving</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>123 Shelter Lane</li>
              <li>Animal City, AC 12345</li>
              <li>(555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © 2026 Vic's Animal Shelter. All rights reserved. Built with love and Gemini AI.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
