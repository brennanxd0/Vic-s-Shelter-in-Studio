
import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  User, 
  AdoptionApplication, 
  FosterApplication, 
  VolunteerApplication,
  Animal,
  VolunteerShift
} from '../types';
import { 
  fetchUserAdoptionApplications, 
  fetchUserFosterApplications, 
  fetchUserVolunteerApplications,
  fetchUserShifts,
  fetchAnimals,
  updateUserProfile
} from '../services/firebaseService';
import { LayoutDashboard, Heart, Home, ClipboardList, Clock, CheckCircle2, XCircle, X, History, Mail, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface ProfileProps {
  user: FirebaseUser | null;
  profile: User | null;
}

const Profile: React.FC<ProfileProps> = ({ user, profile }) => {
  const [adoptionApps, setAdoptionApps] = useState<AdoptionApplication[]>([]);
  const [fosterApps, setFosterApps] = useState<FosterApplication[]>([]);
  const [volunteerApps, setVolunteerApps] = useState<VolunteerApplication[]>([]);
  const [userShifts, setUserShifts] = useState<VolunteerShift[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const [adoptions, fosters, volunteers, shifts, animalsData] = await Promise.all([
          fetchUserAdoptionApplications(user.uid),
          fetchUserFosterApplications(user.uid),
          fetchUserVolunteerApplications(user.uid),
          fetchUserShifts(user.uid),
          fetchAnimals()
        ]);
        
        setAdoptionApps(adoptions);
        setFosterApps(fosters);
        setVolunteerApps(volunteers);
        setUserShifts(shifts);
        setAnimals(animalsData);
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const handleUpdatePreference = async (pref: 'email' | 'phone') => {
    if (!user || updating) return;
    setUpdating(true);
    try {
      await updateUserProfile(user.uid, { preferredCommunication: pref });
      toast.success(`Contact preference updated to ${pref}`);
    } catch (error) {
      console.error("Error updating preference:", error);
      toast.error("Failed to update preference");
    } finally {
      setUpdating(false);
    }
  };

  const getAnimalName = (id: string) => {
    return animals.find(a => a.id === id)?.name || 'Unknown Animal';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Accepted
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
            <XCircle className="w-3 h-3" /> Denied
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
    }
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900 mb-2">Sign In Required</h2>
          <p className="text-slate-500 mb-6">Please sign in to view your application status.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-purple-600 p-3 rounded-2xl shadow-lg shadow-purple-100">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 italic">My Dashboard</h1>
        </div>
        <p className="text-slate-500 font-medium">Track your journey with Vic's Animal Shelter.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-black mb-6 shadow-xl shadow-purple-100">
                {profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">{profile?.name || 'User'}</h2>
              <p className="text-slate-400 text-sm mb-6">{user.email}</p>
              
              <div className="w-full pt-6 border-t border-slate-50 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <Mail className="w-4 h-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-slate-700">{user.email}</p>
                    </div>
                  </div>
                  
                  {profile?.phoneNumber && (
                    <div className="flex items-center gap-3 text-left">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <Phone className="w-4 h-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                        <p className="text-sm font-bold text-slate-700">{profile.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-left">Preferred Contact Method</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdatePreference('email')}
                      disabled={updating}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border ${
                        profile?.preferredCommunication === 'email'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100'
                          : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <Mail className="w-3 h-3" /> Email
                    </button>
                    <button
                      onClick={() => handleUpdatePreference('phone')}
                      disabled={updating}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all border ${
                        profile?.preferredCommunication === 'phone'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-100'
                          : 'bg-white text-slate-500 border-slate-100 hover:bg-slate-50'
                      }`}
                    >
                      <Phone className="w-3 h-3" /> Phone
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Member Since</span>
                    <span className="text-xs font-bold text-slate-700">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowHistory(true)}
                  className="w-full mt-4 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                >
                  <History className="w-4 h-4" /> View Application History
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List & Schedule */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest">Loading your data...</p>
            </div>
          ) : (
            <>
              {/* Volunteer Schedule */}
              {(profile?.role === 'volunteer' || profile?.role === 'staff' || profile?.role === 'admin') && (
                <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-purple-100 p-2 rounded-xl">
                      <Clock className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 italic">My Volunteer Schedule</h3>
                  </div>

                  {userShifts.length > 0 ? (
                    <div className="space-y-4">
                      {userShifts.map(shift => (
                        <div key={shift.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-purple-200 transition-all">
                          <div className="flex items-center gap-6">
                            <div className="bg-white w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-slate-500 font-bold border border-slate-100 shadow-sm">
                              <span className="text-[9px] uppercase opacity-60 tracking-widest">{new Date(shift.date).toLocaleString('default', { month: 'short' })}</span>
                              <span className="text-xl text-slate-800 leading-none">{new Date(shift.date).getDate()}</span>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{shift.title}</h4>
                              <p className="text-slate-500 text-xs mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-purple-500" />
                                {shift.time}
                              </p>
                            </div>
                          </div>
                          <div className="hidden sm:block text-right">
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                              Confirmed
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-6 border-2 border-dashed border-slate-100 rounded-[2rem]">
                      <p className="text-slate-400 font-bold text-sm mb-4">You haven't claimed any shifts yet.</p>
                      <Link to="/volunteer" className="text-purple-600 font-black uppercase text-xs tracking-widest hover:underline">
                        Browse Available Shifts →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center shadow-xl shadow-slate-100">
                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClipboardList className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 italic">Welcome to your Dashboard</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Use the button on the left to view your full application history, including adoption, foster, and volunteer requests.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Application History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-purple-600 p-3 rounded-2xl">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 italic">Application History</h2>
              </div>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto space-y-10">
              {/* Adoption History */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h3 className="text-xl font-black text-slate-900 italic">Adoption Requests</h3>
                </div>
                <div className="space-y-4">
                  {adoptionApps.length > 0 ? (
                    adoptionApps.map(app => (
                      <div key={app.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">Adopting {getAnimalName(app.animalId)}</h4>
                            <p className="text-slate-400 text-xs mt-1">Submitted on {new Date(app.submittedAt).toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 font-bold text-sm text-center py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">No adoption history.</p>
                  )}
                </div>
              </section>

              {/* Foster History */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Home className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-xl font-black text-slate-900 italic">Foster Requests</h3>
                </div>
                <div className="space-y-4">
                  {fosterApps.length > 0 ? (
                    fosterApps.map(app => (
                      <div key={app.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">Fostering {getAnimalName(app.animalId)}</h4>
                            <p className="text-slate-400 text-xs mt-1">Submitted on {new Date(app.submittedAt).toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 font-bold text-sm text-center py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">No foster history.</p>
                  )}
                </div>
              </section>

              {/* Volunteer History */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <ClipboardList className="w-5 h-5 text-purple-500" />
                  <h3 className="text-xl font-black text-slate-900 italic">Volunteer Applications</h3>
                </div>
                <div className="space-y-4">
                  {volunteerApps.length > 0 ? (
                    volunteerApps.map(app => (
                      <div key={app.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">Volunteer Application</h4>
                            <p className="text-slate-400 text-xs mt-1">Submitted on {new Date(app.submittedAt).toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 font-bold text-sm text-center py-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">No volunteer history.</p>
                  )}
                </div>
              </section>
            </div>
            
            <div className="p-8 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setShowHistory(false)}
                className="w-full py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all"
              >
                Close History
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
