
import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../lib/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { createUserProfile } from '../services/firebaseService';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFirebaseConfigured) {
      alert("Firebase is not configured. Please set your environment variables.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      // Create Firestore profile
      await createUserProfile(userCredential.user.uid, {
        name: fullName,
        email: email,
        role: 'user'
      });
      navigate('/');
    } catch (error: any) {
      console.error("Registration error:", error);
      alert(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      alert("Firebase is not configured. Please set your environment variables.");
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error: any) {
      console.error("Google Auth error:", error);
      let message = error.message || "Google sign in failed";
      if (error.code === 'auth/unauthorized-domain') {
        message = "This domain is not authorized in your Firebase console.";
      }
      alert(message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-slate-50">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-purple-50 border border-slate-100">
        <div className="text-center mb-10">
          <div className="bg-purple-600 w-16 h-16 rounded-[1.25rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-purple-100">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708a2 2 0 011.965 2.388l-1.01 4.542a2 2 0 01-1.965 1.57H4.302a2 2 0 01-1.965-1.57l-1.01-4.542A2 2 0 013.292 10H8m6 0v2a2 2 0 11-4 0v-2m4 0V5a2 2 0 10-4 0v5" /></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Create Account</h1>
          <p className="text-slate-500 font-medium">Join our compassionate community</p>
        </div>

        <form className="space-y-6" onSubmit={handleRegister}>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100 font-medium" 
              placeholder="Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Email</label>
            <input 
              required
              type="email" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100 font-medium" 
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Password</label>
            <input 
              required
              type="password" 
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100 font-medium" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-100 w-full"></div>
            <span className="bg-white px-4 text-[10px] font-black text-slate-300 uppercase tracking-widest absolute">Or continue with</span>
          </div>
          <button 
            onClick={handleGoogleSignIn}
            className="w-full py-4 border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all font-bold text-slate-600"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Google
          </button>
        </div>

        <div className="mt-10 text-center">
          <Link 
            to="/auth"
            className="text-sm font-bold text-slate-500 hover:text-purple-700 transition-colors uppercase tracking-widest"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
