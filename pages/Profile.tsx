
import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { 
  User, 
  AdoptionApplication, 
  FosterApplication, 
  VolunteerApplication,
  Animal
} from '../types';
import { 
  fetchUserAdoptionApplications, 
  fetchUserFosterApplications, 
  fetchUserVolunteerApplications,
  fetchAnimals
} from '../services/firebaseService';
import { LayoutDashboard, Heart, Home, ClipboardList, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileProps {
  user: FirebaseUser | null;
  profile: User | null;
}

const Profile: React.FC<ProfileProps> = ({ user, profile }) => {
  const [adoptionApps, setAdoptionApps] = useState<AdoptionApplication[]>([]);
  const [fosterApps, setFosterApps] = useState<FosterApplication[]>([]);
  const [volunteerApps, setVolunteerApps] = useState<VolunteerApplication[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const [adoptions, fosters, volunteers, animalsData] = await Promise.all([
          fetchUserAdoptionApplications(user.uid),
          fetchUserFosterApplications(user.uid),
          fetchUserVolunteerApplications(user.uid),
          fetchAnimals()
        ]);
        
        setAdoptionApps(adoptions);
        setFosterApps(fosters);
        setVolunteerApps(volunteers);
        setAnimals(animalsData);
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  const getAnimalName = (id: string) => {
    return animals.find(a => a.id === id)?.name || 'Unknown Animal';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
            <Clock className="w-3 h-3" /> Pending
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
              
              <div className="w-full pt-6 border-t border-slate-50 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Role</span>
                  <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                    {profile?.role || 'basicUser'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Member Since</span>
                  <span className="text-sm font-bold text-slate-700">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="lg:col-span-2 space-y-8">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest">Loading your applications...</p>
            </div>
          ) : (
            <>
              {/* Adoption Applications */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <h3 className="text-xl font-black text-slate-900 italic">Adoption Requests</h3>
                </div>
                <div className="space-y-4">
                  {adoptionApps.length > 0 ? (
                    adoptionApps.map(app => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={app.id} 
                        className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">Adopting {getAnimalName(app.animalId)}</h4>
                            <p className="text-slate-400 text-xs mt-1">Submitted on {new Date(app.submittedAt).toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
                      <p className="text-slate-400 font-bold text-sm">No adoption applications found.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Foster Applications */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Home className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-xl font-black text-slate-900 italic">Foster Requests</h3>
                </div>
                <div className="space-y-4">
                  {fosterApps.length > 0 ? (
                    fosterApps.map(app => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={app.id} 
                        className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">Fostering {getAnimalName(app.animalId)}</h4>
                            <p className="text-slate-400 text-xs mt-1">Submitted on {new Date(app.submittedAt).toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
                      <p className="text-slate-400 font-bold text-sm">No foster applications found.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Volunteer Applications */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <ClipboardList className="w-5 h-5 text-purple-500" />
                  <h3 className="text-xl font-black text-slate-900 italic">Volunteer Applications</h3>
                </div>
                <div className="space-y-4">
                  {volunteerApps.length > 0 ? (
                    volunteerApps.map(app => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={app.id} 
                        className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">Volunteer Application</h4>
                            <p className="text-slate-400 text-xs mt-1">Submitted on {new Date(app.submittedAt).toLocaleDateString()}</p>
                          </div>
                          {getStatusBadge(app.status)}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center">
                      <p className="text-slate-400 font-bold text-sm">No volunteer applications found.</p>
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
