
import React, { useState } from 'react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-slate-50">
      <div className="bg-white w-full max-w-md rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-purple-50 border border-slate-100">
        <div className="text-center mb-10">
          <div className="bg-purple-600 w-16 h-16 rounded-[1.25rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-purple-100">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.708a2 2 0 011.965 2.388l-1.01 4.542a2 2 0 01-1.965 1.57H4.302a2 2 0 01-1.965-1.57l-1.01-4.542A2 2 0 013.292 10H8m6 0v2a2 2 0 11-4 0v-2m4 0V5a2 2 0 10-4 0v5" /></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">{isLogin ? 'Welcome Back!' : 'Create Account'}</h1>
          <p className="text-slate-500 font-medium">{isLogin ? "Ready to help more animals at Vic's?" : 'Join our compassionate community'}</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Full Name</label>
              <input type="text" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100 font-medium" placeholder="Jane Smith" />
            </div>
          )}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Email</label>
            <input type="email" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100 font-medium" placeholder="jane@example.com" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
              {isLogin && <button className="text-xs font-black text-purple-700 hover:underline tracking-widest uppercase">Forgot?</button>}
            </div>
            <input type="password" title="password" className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100 font-medium" placeholder="••••••••" />
          </div>

          <button className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black shadow-xl hover:bg-slate-800 transition-all active:scale-[0.98]">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-slate-500 hover:text-purple-700 transition-colors uppercase tracking-widest"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
