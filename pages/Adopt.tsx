
import React, { useState, useEffect } from 'react';
import { Animal, AnimalType, AdoptionApplication } from '../types.ts';
import { getAIPetAdvice, generateAnimalBio } from '../services/geminiService.ts';
import { submitApplication } from '../services/firebaseService';
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
  const [matchingAdvice, setMatchingAdvice] = useState<string>('');
  const [isMatching, setIsMatching] = useState(false);
  const [lifestyle, setLifestyle] = useState('apartment');
  const [animalBios, setAnimalBios] = useState<Record<string, string>>({});
  const [isApplying, setIsApplying] = useState(false);
  const [appFormData, setAppFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    homeType: 'House',
    hasOtherPets: false,
    reason: ''
  });
  const [appStatus, setAppStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    if (!user) {
      toast.info("Sign in to access adoption applications and personalized AI advice!", {
        id: 'guest-prompt',
        duration: 5000,
        icon: <AlertCircle className="w-5 h-5 text-blue-500" />
      });
    }
  }, [user]);

  const filteredAnimals = filter === 'All' 
    ? animals.filter(a => !a.status || a.status === 'available')
    : animals.filter(a => a.type === filter && (!a.status || a.status === 'available'));

  const handleMatchMe = async () => {
    setIsMatching(true);
    setMatchingAdvice('');
    const advice = await getAIPetAdvice(filter === 'All' ? 'Pet' : filter, lifestyle);
    setMatchingAdvice(advice);
    setIsMatching(false);
  };

  const getBio = async (animal: Animal) => {
    if (animalBios[animal.id]) return;
    const bio = await generateAnimalBio(animal);
    setAnimalBios(prev => ({ ...prev, [animal.id]: bio }));
  };

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
              <p className="text-slate-600 text-sm">Create an account or sign in to submit adoption applications and get personalized AI pet matching.</p>
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

      {/* AI Matchmaker Tool */}
      <div className="mb-16 bg-gradient-to-br from-purple-700 to-indigo-800 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-purple-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="md:w-1/3 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-4">Gemini AI Pet Matchmaker</h2>
            <p className="opacity-90 text-sm mb-6">Tell us about your lifestyle and we'll help you find the perfect companion at Vic's.</p>
            <div className="space-y-4">
              <select 
                value={lifestyle}
                onChange={(e) => setLifestyle(e.target.value)}
                className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 ring-white/50"
              >
                <option value="apartment" className="text-slate-800">I live in an apartment</option>
                <option value="house with yard" className="text-slate-800">I have a house with a yard</option>
                <option value="active outdoor" className="text-slate-800">I'm always outdoors/hiking</option>
                <option value="quiet home" className="text-slate-800">I prefer a quiet home life</option>
              </select>
              <button 
                onClick={handleMatchMe}
                disabled={isMatching}
                className="w-full bg-white text-purple-700 font-bold py-3 rounded-xl hover:bg-purple-50 transition-colors disabled:opacity-50 shadow-lg"
              >
                {isMatching ? 'Matching...' : 'Get AI Recommendations'}
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/10 rounded-2xl p-6 border border-white/10 min-h-[200px] flex items-center justify-center italic backdrop-blur-sm">
            {matchingAdvice ? (
              <p className="text-lg leading-relaxed">{matchingAdvice}</p>
            ) : (
              <p className="text-white/60">Your personalized advice from our shelter experts will appear here...</p>
            )}
          </div>
        </div>
      </div>

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
                {animalBios[animal.id] || animal.description}
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {animal.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-black uppercase tracking-widest text-purple-500 bg-purple-50/50 px-2 py-1 rounded-lg">#{tag}</span>
                ))}
              </div>
              <button 
                onClick={() => { setSelectedAnimal(animal); getBio(animal); }}
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
                    {animalBios[selectedAnimal.id] || selectedAnimal.description}
                  </p>
                </div>

                {!user ? (
                  <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl text-center">
                    <h3 className="text-xl font-black text-slate-900 mb-4 italic">Ready to Adopt?</h3>
                    <p className="text-slate-500 mb-6 text-sm">You must be signed in to submit an adoption application for {selectedAnimal.name}.</p>
                    <div className="flex flex-col gap-3">
                      <Link to="/auth" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all">
                        Sign In to Apply
                      </Link>
                      <Link to="/register" className="text-sm font-bold text-purple-600 hover:underline uppercase tracking-widest">
                        Create an Account
                      </Link>
                    </div>
                  </div>
                ) : !isApplying ? (
                  <>
                    <button 
                      onClick={() => setIsApplying(true)}
                      className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all"
                    >
                      Apply to Adopt {selectedAnimal.name}
                    </button>
                    <p className="text-center text-slate-400 text-[10px] mt-5 font-bold uppercase tracking-widest">No application fee required • Vic's Animal Shelter</p>
                  </>
                ) : appStatus === 'success' ? (
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
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-purple-100"
                      value={appFormData.applicantName}
                      onChange={e => setAppFormData({...appFormData, applicantName: e.target.value})}
                    />
                    <input 
                      required
                      type="email" 
                      placeholder="Email Address" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-purple-100"
                      value={appFormData.applicantEmail}
                      onChange={e => setAppFormData({...appFormData, applicantEmail: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl"
                        value={appFormData.homeType}
                        onChange={e => setAppFormData({...appFormData, homeType: e.target.value})}
                      >
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Farm">Farm</option>
                      </select>
                      <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <input 
                          type="checkbox" 
                          id="otherPets"
                          checked={appFormData.hasOtherPets}
                          onChange={e => setAppFormData({...appFormData, hasOtherPets: e.target.checked})}
                        />
                        <label htmlFor="otherPets" className="text-xs font-bold text-slate-600">Other Pets?</label>
                      </div>
                    </div>
                    <textarea 
                      required
                      placeholder="Why do you want to adopt?" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl h-24 focus:ring-2 ring-purple-100"
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
