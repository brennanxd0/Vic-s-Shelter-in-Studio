
import React, { useState, useEffect } from 'react';
import { Animal, AnimalType, AdoptionApplication, FosterApplication } from '../types.ts';
import { submitApplication, submitFosterApplication } from '../services/firebaseService';
import { toast } from 'sonner';
import { User as FirebaseUser } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

interface AdoptProps {
  animals: Animal[];
  user: FirebaseUser | null;
}

const Adopt: React.FC<AdoptProps> = ({ animals, user }) => {
  const [filter, setFilter] = useState<AnimalType | 'All'>('All');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isFosterApplying, setIsFosterApplying] = useState(false);
  const [appFormData, setAppFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    homeType: 'House',
    hasOtherPets: false,
    reason: ''
  });
  const [fosterAppFormData, setFosterAppFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    hasOtherPets: false,
    canIsolate: false,
    canTransport: false,
    preferences: [] as string[],
    fosterDuration: 'Short-term (1-2 weeks)',
    experience: ''
  });
  const [appStatus, setAppStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [fosterAppStatus, setFosterAppStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    if (!user) {
      toast.info("Sign in to access adoption applications!", {
        id: 'guest-prompt',
        duration: 5000,
        icon: <AlertCircle className="w-5 h-5 text-blue-500" />
      });
    }
  }, [user]);

  const filteredAnimals = filter === 'All' 
    ? animals.filter(a => !a.status || a.status === 'available')
    : animals.filter(a => a.type === filter && (!a.status || a.status === 'available'));

  const handleAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;
    
    setAppStatus('submitting');
    try {
      if (!user) throw new Error("User not authenticated");
      await submitApplication({
        userId: user.uid,
        animalId: selectedAnimal.id,
        ...appFormData,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
      setAppStatus('success');
      toast.success(`Application for ${selectedAnimal.name} submitted successfully!`);
      setTimeout(() => {
        setAppStatus('idle');
        setIsApplying(false);
        setSelectedAnimal(null);
        setAppFormData({ applicantName: '', applicantEmail: '', homeType: 'House', hasOtherPets: false, reason: '' });
      }, 2000);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast.error("Failed to submit application. Please try again.");
      setAppStatus('idle');
    }
  };

  const handleFosterAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal) return;
    
    setFosterAppStatus('submitting');
    try {
      if (!user) throw new Error("User not authenticated");
      await submitFosterApplication({
        userId: user.uid,
        animalId: selectedAnimal.id,
        ...fosterAppFormData,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
      setFosterAppStatus('success');
      toast.success(`Foster application for ${selectedAnimal.name} submitted successfully!`);
      setTimeout(() => {
        setFosterAppStatus('idle');
        setIsFosterApplying(false);
        setSelectedAnimal(null);
        setFosterAppFormData({
          applicantName: '',
          applicantEmail: '',
          address: '',
          city: '',
          state: '',
          zip: '',
          hasOtherPets: false,
          canIsolate: false,
          canTransport: false,
          preferences: [],
          fosterDuration: 'Short-term (1-2 weeks)',
          experience: ''
        });
      }, 2000);
    } catch (error) {
      console.error("Error submitting foster application:", error);
      toast.error("Failed to submit foster application. Please try again.");
      setFosterAppStatus('idle');
    }
  };

  const RadioGroup = ({ label, name, value, onChange }: { label: string, name: string, value: boolean, onChange: (val: boolean) => void }) => (
    <div className="space-y-3">
      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex gap-3">
        {[true, false].map((option) => (
          <button
            key={option.toString()}
            type="button"
            onClick={() => onChange(option)}
            className={`flex-1 py-3 px-4 rounded-xl border-2 font-bold transition-all ${
              value === option 
                ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-100' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-purple-200'
            }`}
          >
            {option ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Adoptable Friends</h1>
          <p className="text-slate-500">Every animal here is microchipped, vaccinated, and ready for a home.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['All', ...Object.values(AnimalType)].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                filter === type 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-100' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-purple-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {!user && (
        <div className="mb-12 bg-blue-50 border border-blue-100 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Guest Access Limited</h3>
              <p className="text-slate-600 text-sm">Create an account or sign in to submit adoption applications.</p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAnimals.map((animal) => (
          <div key={animal.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="relative h-72 overflow-hidden">
              <img src={animal.image} alt={animal.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
              <div className="absolute top-4 left-4 flex gap-2">
                 <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">{animal.gender}</span>
                 <span className="bg-white/95 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">{animal.age}</span>
              </div>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{animal.name}</h3>
                  <p className="text-slate-500 text-sm font-medium">{animal.breed}</p>
                </div>
                <div className="bg-purple-50 text-purple-600 p-2 rounded-xl">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                </div>
              </div>
              <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed italic">
                {animal.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {animal.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-purple-500 bg-purple-50/50 px-2 py-1 rounded-lg">#{tag}</span>
                ))}
              </div>
              <button 
                onClick={() => { setSelectedAnimal(animal); }}
                className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100"
              >
                View Full Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Modal */}
      {selectedAnimal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button 
              onClick={() => setSelectedAnimal(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 h-[450px] md:h-auto">
                <img src={selectedAnimal.image} className="w-full h-full object-cover" alt={selectedAnimal.name} referrerPolicy="no-referrer" />
              </div>
              <div className="md:w-1/2 p-8 md:p-14">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-purple-100 text-purple-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">{selectedAnimal.type}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-bold">{selectedAnimal.breed}</span>
                </div>
                <h2 className="text-5xl font-black text-slate-900 mb-6">{selectedAnimal.name}</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-slate-400 text-xs font-black uppercase mb-1 tracking-widest">Age</div>
                    <div className="text-slate-900 font-bold">{selectedAnimal.age}</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-slate-400 text-xs font-black uppercase mb-1 tracking-widest">Gender</div>
                    <div className="text-slate-900 font-bold">{selectedAnimal.gender}</div>
                  </div>
                </div>

                <div className="mb-10">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">About {selectedAnimal.name}</h3>
                  <p className="text-slate-600 leading-relaxed italic border-l-4 border-purple-400 pl-4 bg-purple-50/20 py-4 rounded-r-2xl">
                    {selectedAnimal.description}
                  </p>
                </div>

                {!user ? (
                  <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl text-center">
                    <h3 className="text-xl font-black text-slate-900 mb-4 italic">Ready to Help?</h3>
                    <p className="text-slate-500 mb-6 text-sm">You must be signed in to submit an application for {selectedAnimal.name}.</p>
                    <div className="flex flex-col gap-3">
                      <Link to="/auth" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all">
                        Sign In to Apply
                      </Link>
                      <Link to="/register" className="text-sm font-bold text-purple-600 hover:underline uppercase tracking-widest">
                        Create an Account
                      </Link>
                    </div>
                  </div>
                ) : (!isApplying && !isFosterApplying) ? (
                  <div className="space-y-4">
                    <button 
                      onClick={() => setIsApplying(true)}
                      className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all"
                    >
                      Apply to Adopt {selectedAnimal.name}
                    </button>
                    <button 
                      onClick={() => setIsFosterApplying(true)}
                      className="w-full py-4 bg-white border-2 border-purple-600 text-purple-600 rounded-2xl font-bold hover:bg-purple-50 transition-all"
                    >
                      Foster {selectedAnimal.name}
                    </button>
                    <p className="text-center text-slate-400 text-[10px] mt-5 font-bold uppercase tracking-widest">No application fee required • Vic's Animal Shelter</p>
                  </div>
                ) : isApplying ? (
                  appStatus === 'success' ? (
                    <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center">
                      <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-100">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      </div>
                      <h3 className="text-xl font-black text-emerald-900 mb-2">Application Sent!</h3>
                      <p className="text-emerald-700 text-sm font-medium">Vic's staff will review your request and contact you soon.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleAppSubmit} className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-bold text-slate-900">Adoption Request</h3>
                        <button type="button" onClick={() => setIsApplying(false)} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Cancel</button>
                      </div>
                      <input 
                        required
                        type="text" 
                        placeholder="Your Full Name" 
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-purple-100 outline-none transition-all"
                        value={appFormData.applicantName}
                        onChange={e => setAppFormData({...appFormData, applicantName: e.target.value})}
                      />
                      <input 
                        required
                        type="email" 
                        placeholder="Email Address" 
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 ring-purple-100 outline-none transition-all"
                        value={appFormData.applicantEmail}
                        onChange={e => setAppFormData({...appFormData, applicantEmail: e.target.value})}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <select 
                          className="px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 ring-purple-100"
                          value={appFormData.homeType}
                          onChange={e => setAppFormData({...appFormData, homeType: e.target.value})}
                        >
                          <option value="House">House</option>
                          <option value="Apartment">Apartment</option>
                          <option value="Farm">Farm</option>
                        </select>
                        <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl">
                          <input 
                            type="checkbox" 
                            id="otherPets"
                            className="w-4 h-4 text-purple-600 rounded"
                            checked={appFormData.hasOtherPets}
                            onChange={e => setAppFormData({...appFormData, hasOtherPets: e.target.checked})}
                          />
                          <label htmlFor="otherPets" className="text-xs font-bold text-slate-600">Other Pets?</label>
                        </div>
                      </div>
                      <textarea 
                        required
                        placeholder="Why do you want to adopt?" 
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl h-24 focus:ring-2 ring-purple-100 outline-none transition-all resize-none"
                        value={appFormData.reason}
                        onChange={e => setAppFormData({...appFormData, reason: e.target.value})}
                      ></textarea>
                      <button 
                        type="submit" 
                        disabled={appStatus === 'submitting'}
                        className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all disabled:opacity-50"
                      >
                        {appStatus === 'submitting' ? 'Submitting...' : 'Submit Application'}
                      </button>
                    </form>
                  )
                ) : (
                  <div className="fixed inset-0 z-[70] bg-white overflow-y-auto">
                    <div className="max-w-3xl mx-auto px-6 py-12">
                      <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-black text-slate-900">Foster Application</h2>
                        <button 
                          onClick={() => setIsFosterApplying(false)}
                          className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                        >
                          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>

                      {fosterAppStatus === 'success' ? (
                        <div className="bg-emerald-50 border border-emerald-100 p-12 rounded-[3rem] text-center">
                          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-emerald-100">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                          </div>
                          <h3 className="text-3xl font-black text-emerald-900 mb-4">Application Received!</h3>
                          <p className="text-emerald-700 text-lg font-medium mb-8">Thank you for opening your home to {selectedAnimal.name}. Our foster coordinator will be in touch shortly.</p>
                          <button 
                            onClick={() => { setSelectedAnimal(null); setIsFosterApplying(false); }}
                            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all"
                          >
                            Back to Animals
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleFosterAppSubmit} className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                              <input 
                                required
                                type="text" 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-purple-100 outline-none transition-all"
                                value={fosterAppFormData.applicantName}
                                onChange={e => setFosterAppFormData({...fosterAppFormData, applicantName: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                              <input 
                                required
                                type="email" 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-purple-100 outline-none transition-all"
                                value={fosterAppFormData.applicantEmail}
                                onChange={e => setFosterAppFormData({...fosterAppFormData, applicantEmail: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Home Address</label>
                            <input 
                              required
                              type="text" 
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-purple-100 outline-none transition-all"
                              value={fosterAppFormData.address}
                              onChange={e => setFosterAppFormData({...fosterAppFormData, address: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">City</label>
                              <input 
                                required
                                type="text" 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-purple-100 outline-none transition-all"
                                value={fosterAppFormData.city}
                                onChange={e => setFosterAppFormData({...fosterAppFormData, city: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">State</label>
                              <input 
                                required
                                type="text" 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-purple-100 outline-none transition-all"
                                value={fosterAppFormData.state}
                                onChange={e => setFosterAppFormData({...fosterAppFormData, state: e.target.value})}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Zip Code</label>
                              <input 
                                required
                                type="text" 
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-purple-100 outline-none transition-all"
                                value={fosterAppFormData.zip}
                                onChange={e => setFosterAppFormData({...fosterAppFormData, zip: e.target.value})}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <RadioGroup 
                              label="Other Pets?" 
                              name="hasOtherPets" 
                              value={fosterAppFormData.hasOtherPets} 
                              onChange={(val) => setFosterAppFormData({...fosterAppFormData, hasOtherPets: val})} 
                            />
                            <RadioGroup 
                              label="Can Isolate?" 
                              name="canIsolate" 
                              value={fosterAppFormData.canIsolate} 
                              onChange={(val) => setFosterAppFormData({...fosterAppFormData, canIsolate: val})} 
                            />
                            <RadioGroup 
                              label="Can Transport?" 
                              name="canTransport" 
                              value={fosterAppFormData.canTransport} 
                              onChange={(val) => setFosterAppFormData({...fosterAppFormData, canTransport: val})} 
                            />
                          </div>

                          <div className="space-y-4">
                            <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Animal Preferences</label>
                            <div className="flex flex-wrap gap-4">
                              {['Dogs', 'Cats', 'Puppies', 'Kittens', 'Senior Animals', 'Special Needs'].map(pref => (
                                <label key={pref} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                                  <input 
                                    type="checkbox" 
                                    className="w-4 h-4 text-purple-600 rounded"
                                    checked={fosterAppFormData.preferences.includes(pref)}
                                    onChange={(e) => {
                                      const newPrefs = e.target.checked 
                                        ? [...fosterAppFormData.preferences, pref]
                                        : fosterAppFormData.preferences.filter(p => p !== pref);
                                      setFosterAppFormData({...fosterAppFormData, preferences: newPrefs});
                                    }}
                                  />
                                  <span className="text-sm font-bold text-slate-700">{pref}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Length of Foster</label>
                            <select 
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 ring-purple-100 outline-none transition-all font-bold text-slate-700"
                              value={fosterAppFormData.fosterDuration}
                              onChange={e => setFosterAppFormData({...fosterAppFormData, fosterDuration: e.target.value})}
                            >
                              <option>Short-term (1-2 weeks)</option>
                              <option>Medium-term (3-5 weeks)</option>
                              <option>Foster-to-adopt (Trial period)</option>
                              <option>Until adopted (Indefinite)</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Experience & Description</label>
                            <textarea 
                              required
                              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl h-40 focus:ring-4 ring-purple-100 outline-none transition-all resize-none"
                              placeholder="Tell us about your experience with animals..."
                              value={fosterAppFormData.experience}
                              onChange={e => setFosterAppFormData({...fosterAppFormData, experience: e.target.value})}
                            ></textarea>
                          </div>

                          <div className="flex gap-4 pt-4">
                            <button 
                              type="button"
                              onClick={() => setIsFosterApplying(false)}
                              className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                            >
                              Back
                            </button>
                            <button 
                              type="submit" 
                              disabled={fosterAppStatus === 'submitting'}
                              className="flex-[2] py-5 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all disabled:opacity-50"
                            >
                              {fosterAppStatus === 'submitting' ? 'Submitting...' : 'Submit Foster Application'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adopt;
