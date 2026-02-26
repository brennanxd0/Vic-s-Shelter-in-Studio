
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { User as AppUser } from '../types';
import { Menu, X, PawPrint, LogOut, User as UserIcon, Shield, LayoutDashboard } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: FirebaseUser | null;
  profile: AppUser | null;
}

const Layout: React.FC<LayoutProps> = ({ children, user, profile }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-purple-600 p-2 rounded-2xl shadow-lg shadow-purple-100 group-hover:scale-110 transition-transform">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight italic">Vic's Shelter</span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 bg-slate-50 p-1 rounded-2xl border border-slate-100">
              <Link to="/" className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${isActive('#/') ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Home</Link>
              <Link to="/adopt" className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${isActive('#/adopt') ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Adopt</Link>
              <Link to="/foster" className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${isActive('#/foster') ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Foster</Link>
              <Link to="/volunteer" className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${isActive('#/volunteer') ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Volunteer</Link>
              <Link to="/donate" className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${isActive('#/donate') ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>Donate</Link>
              {(profile?.role === 'admin' || profile?.role === 'staff') && (
                <Link to="/admin" className={`px-4 py-2 text-sm font-bold rounded-xl transition-all flex items-center gap-2 ${isActive('#/admin') ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                  <Shield className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <Link 
                      to="/profile" 
                      className={`p-2 transition-colors rounded-xl border ${isActive('#/profile') ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-slate-50 text-slate-400 hover:text-purple-600 border-slate-100'}`}
                      title="My Dashboard"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                    </Link>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Account</div>
                      <div className="text-sm font-bold text-slate-800 leading-none">{user.displayName || user.email?.split('@')[0]}</div>
                    </div>
                    <button 
                      onClick={handleSignOut}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 rounded-xl border border-slate-100"
                      title="Sign Out"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link to="/auth" className="text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors px-4">Sign In</Link>
                    <Link to="/register" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">Sign Up</Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-2 shadow-xl animate-in slide-in-from-top duration-200">
            <Link onClick={() => setIsMenuOpen(false)} to="/" className={`block px-4 py-3 rounded-xl font-bold ${isActive('#/') ? 'bg-purple-50 text-purple-600' : 'text-slate-600'}`}>Home</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/adopt" className={`block px-4 py-3 rounded-xl font-bold ${isActive('#/adopt') ? 'bg-purple-50 text-purple-600' : 'text-slate-600'}`}>Adopt</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/foster" className={`block px-4 py-3 rounded-xl font-bold ${isActive('#/foster') ? 'bg-purple-50 text-purple-600' : 'text-slate-600'}`}>Foster</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/volunteer" className={`block px-4 py-3 rounded-xl font-bold ${isActive('#/volunteer') ? 'bg-purple-50 text-purple-600' : 'text-slate-600'}`}>Volunteer</Link>
            <Link onClick={() => setIsMenuOpen(false)} to="/donate" className={`block px-4 py-3 rounded-xl font-bold ${isActive('#/donate') ? 'bg-purple-50 text-purple-600' : 'text-slate-600'}`}>Donate</Link>
            {user && (
              <Link onClick={() => setIsMenuOpen(false)} to="/profile" className={`block px-4 py-3 rounded-xl font-bold ${isActive('#/profile') ? 'bg-purple-50 text-purple-600' : 'text-slate-600'}`}>My Dashboard</Link>
            )}
            {(profile?.role === 'admin' || profile?.role === 'staff') && (
              <Link onClick={() => setIsMenuOpen(false)} to="/admin" className={`block px-4 py-3 rounded-xl font-bold ${isActive('#/admin') ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Admin Dashboard</Link>
            )}
            <div className="pt-4 border-t border-slate-100 mt-4">
              {user ? (
                <div className="flex items-center justify-between px-4 py-2">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed in as</div>
                    <div className="text-sm font-bold text-slate-800">{user.email}</div>
                  </div>
                  <button onClick={handleSignOut} className="text-red-600 font-bold text-sm">Sign Out</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link onClick={() => setIsMenuOpen(false)} to="/auth" className="py-3 text-center font-bold text-slate-600 bg-slate-50 rounded-xl">Sign In</Link>
                  <Link onClick={() => setIsMenuOpen(false)} to="/register" className="py-3 text-center font-bold text-white bg-purple-600 rounded-xl">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
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
              <li><Link to="/foster" className="hover:text-purple-400 transition-colors">Foster Program</Link></li>
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
