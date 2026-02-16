
import React, { useState } from 'react';
import { MOCK_SHIFTS } from '../constants.tsx';

const Volunteer: React.FC = () => {
  const [showRegForm, setShowRegForm] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setShowRegForm(false);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Be a Hero in Their Story</h1>
        <p className="text-slate-600 max-w-2xl text-lg">Our shelter runs on the love and dedication of our volunteers. From walking dogs to helping with events, there's a place for you at Vic's.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
            <span className="bg-purple-100 p-2 rounded-xl mr-3">
              <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </span>
            Upcoming Shifts
          </h2>
          
          <div className="space-y-4">
            {MOCK_SHIFTS.map(shift => (
              <div key={shift.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-purple-200 transition-all duration-300">
                <div className="flex items-center gap-6 w-full sm:w-auto">
                  <div className="bg-slate-50 w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-slate-500 font-bold border border-slate-100">
                    <span className="text-[10px] uppercase opacity-60 tracking-widest">{new Date(shift.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-2xl text-slate-800 leading-none">{new Date(shift.date).getDate()}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{shift.title}</h3>
                    <div className="flex items-center text-sm text-slate-500 mt-1">
                       <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                       {shift.time}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                   <div className="text-right hidden sm:block">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available</div>
                      <div className="text-slate-900 font-bold">{shift.slots} Slots</div>
                   </div>
                   <button className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-slate-100">Claim</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center">
            <h3 className="text-xl font-bold text-slate-700 mb-2">Want a custom schedule?</h3>
            <p className="text-slate-500 mb-6">If you can't find a shift that fits, let us know and we'll work with you.</p>
            <button className="text-purple-700 font-black uppercase text-sm tracking-widest hover:underline transition-all">Contact Coordinator →</button>
          </div>
        </div>

        <div>
          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-2xl shadow-purple-50 sticky top-24">
            <h2 className="text-2xl font-black text-slate-900 mb-6 leading-tight">New to Vic's?</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">Before you can sign up for shifts, you need to complete our orientation program.</p>
            
            <ul className="space-y-6 mb-10">
              <li className="flex items-start">
                <div className="bg-purple-100 text-purple-700 w-9 h-9 rounded-xl flex items-center justify-center font-black mr-4 shrink-0 shadow-sm shadow-purple-50">1</div>
                <div>
                  <h4 className="font-bold text-slate-800">Register Online</h4>
                  <p className="text-xs text-slate-500">Quick and easy onboarding form.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-purple-100 text-purple-700 w-9 h-9 rounded-xl flex items-center justify-center font-black mr-4 shrink-0 shadow-sm shadow-purple-50">2</div>
                <div>
                  <h4 className="font-bold text-slate-800">Watch Orientation</h4>
                  <p className="text-xs text-slate-500">Safety first for you and our pets.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-purple-100 text-purple-700 w-9 h-9 rounded-xl flex items-center justify-center font-black mr-4 shrink-0 shadow-sm shadow-purple-50">3</div>
                <div>
                  <h4 className="font-bold text-slate-800">First Shift</h4>
                  <p className="text-xs text-slate-500">Book your shadow shift today.</p>
                </div>
              </li>
            </ul>

            <button 
              onClick={() => setShowRegForm(true)}
              className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all hover:scale-[1.02]"
            >
              Start Application
            </button>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] max-w-lg w-full p-8 md:p-14 relative shadow-2xl">
            {success ? (
              <div className="text-center py-10">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-50">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">Application Sent!</h2>
                <p className="text-slate-500 font-medium">We've received your interest. Welcome to the Vic's Animal Shelter family!</p>
              </div>
            ) : (
              <>
                <button 
                  onClick={() => setShowRegForm(false)}
                  className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                >
                  <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-3xl font-black text-slate-900 mb-8 italic">Join the Team</h2>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Full Name</label>
                    <input type="text" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Email Address</label>
                    <input type="email" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Why Volunteer at Vic's?</label>
                    <textarea required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100 h-32" placeholder="Tell us about your love for animals..."></textarea>
                  </div>
                  <button type="submit" className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all">Submit Application</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteer;
