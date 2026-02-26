
import React, { useState, useEffect } from 'react';
import { VolunteerShift, User, VolunteerApplication } from '../types.ts';
import { fetchShifts, submitVolunteerApplication } from '../services/firebaseService.ts';
import { toast } from 'sonner';
import { User as FirebaseUser } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Lock, ShieldCheck } from 'lucide-react';

interface VolunteerProps {
  user: FirebaseUser | null;
  profile: User | null;
}

const Volunteer: React.FC<VolunteerProps> = ({ user, profile }) => {
  const [shifts, setShifts] = useState<VolunteerShift[]>([]);
  const [showRegForm, setShowRegForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [regFormData, setRegFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.info("Sign in to view volunteer schedules and claim shifts!", {
        id: 'guest-prompt',
        duration: 5000,
        icon: <AlertCircle className="w-5 h-5 text-blue-500" />
      });
    }
  }, [user]);

  useEffect(() => {
    const loadShifts = async () => {
      const data = await fetchShifts();
      setShifts(data);
      setLoading(false);
    };
    loadShifts();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    try {
      await submitVolunteerApplication({
        userId: user.uid,
        applicantName: regFormData.applicantName,
        applicantEmail: regFormData.applicantEmail,
        reason: regFormData.reason,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
      toast.success("Volunteer application submitted successfully! We'll be in touch.");
      setShowRegForm(false);
      setRegFormData({ applicantName: '', applicantEmail: '', reason: '' });
    } catch (error) {
      console.error("Error submitting volunteer application:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Be a Hero in Their Story</h1>
        <p className="text-slate-600 max-w-2xl text-lg">Our shelter runs on the love and dedication of our volunteers. From walking dogs to helping with events, there's a place for you at Vic's.</p>
      </div>

      {!user && (
        <div className="mb-12 bg-blue-50 border border-blue-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Volunteer Portal Locked</h3>
              <p className="text-slate-600 text-sm">Create an account or sign in to view the full schedule, claim shifts, and register as a volunteer.</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Link to="/auth" className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
              <LogIn className="w-4 h-4" /> Sign In
            </Link>
            <Link to="/register" className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
              <UserPlus className="w-4 h-4" /> Sign Up
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center">
            <span className="bg-purple-100 p-2 rounded-xl mr-3">
              <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            </span>
            Upcoming Shifts
          </h2>
          
          <div className="space-y-4 relative">
            {(!user || (profile?.role === 'basicUser')) && (
              <div className="absolute inset-0 z-10 backdrop-blur-[2px] bg-white/30 rounded-[2rem] flex items-center justify-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center max-w-sm mx-4">
                  <div className="bg-slate-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {!user ? 'Schedule is Private' : 'Volunteer Access Required'}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6">
                    {!user 
                      ? 'Please sign in to view available volunteer shifts and claim your spot.' 
                      : 'You must be a registered volunteer to view and claim shifts. Apply below!'}
                  </p>
                  {!user ? (
                    <Link to="/auth" className="inline-block px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all">
                      Sign In Now
                    </Link>
                  ) : (
                    <button 
                      onClick={() => setShowRegForm(true)}
                      className="inline-block px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all"
                    >
                      Apply to Volunteer
                    </button>
                  )}
                </div>
              </div>
            )}
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading shifts...</div>
            ) : shifts.length > 0 ? (
              shifts.map(shift => (
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
                      <button 
                        onClick={() => toast.success(`Shift "${shift.title}" claimed! See you there.`)}
                        className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-slate-100"
                      >
                        Claim
                      </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 font-bold">No shifts currently available.</div>
            )}
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
              onClick={() => {
                if (!user) {
                  toast.error("Please sign in to start your volunteer application.");
                  return;
                }
                setShowRegForm(true);
              }}
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
                <input 
                  type="text" 
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100" 
                  placeholder="John Doe" 
                  value={regFormData.applicantName}
                  onChange={e => setRegFormData({...regFormData, applicantName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100" 
                  placeholder="john@example.com" 
                  value={regFormData.applicantEmail}
                  onChange={e => setRegFormData({...regFormData, applicantEmail: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Why Volunteer at Vic's?</label>
                <textarea 
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100 h-32" 
                  placeholder="Tell us about your love for animals..."
                  value={regFormData.reason}
                  onChange={e => setRegFormData({...regFormData, reason: e.target.value})}
                ></textarea>
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteer;
