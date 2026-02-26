
import React, { useState, useEffect } from 'react';
import { Animal, AnimalType, FosterApplication } from '../types.ts';
import { generateAnimalBio } from '../services/geminiService.ts';
import { submitFosterApplication } from '../services/firebaseService';
import { toast } from 'sonner';
import { User as FirebaseUser } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { LogIn, UserPlus, AlertCircle, Heart, Home, Info, X } from 'lucide-react';

interface FosterProps {
  animals: Animal[];
  user: FirebaseUser | null;
}

const Foster: React.FC<FosterProps> = ({ animals, user }) => {
  const [filter, setFilter] = useState<AnimalType | 'All'>('All');
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [animalBios, setAnimalBios] = useState<Record<string, string>>({});
  const [isApplying, setIsApplying] = useState(false);
  const [appFormData, setAppFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    hasOtherPets: false,
    fosterDuration: 'Short-term (1-2 weeks)',
    experience: ''
  });
  const [appStatus, setAppStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    if (!user) {
      toast.info("Sign in to access foster applications and help save lives!", {
        id: 'guest-prompt',
        duration: 5000,
        icon: <AlertCircle className="w-5 h-5 text-blue-500" />
      });
    }
  }, [user]);

  const filteredAnimals = filter === 'All' 
    ? animals.filter(a => !a.status || a.status === 'available')
    : animals.filter(a => a.type === filter && (!a.status || a.status === 'available'));

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
      await submitFosterApplication({
        userId: user.uid,
        animalId: selectedAnimal.id,
        ...appFormData,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
      setAppStatus('success');
      toast.success(`Foster application for ${selectedAnimal.name} submitted successfully!`);
      setTimeout(() => {
        setAppStatus('idle');
        setIsApplying(false);
        setSelectedAnimal(null);
        setAppFormData({ 
          applicantName: '', 
          applicantEmail: '', 
          address: '', 
          city: '', 
          state: '', 
          zip: '', 
          hasOtherPets: false, 
          fosterDuration: 'Short-term (1-2 weeks)', 
          experience: '' 
        });
      }, 2000);
    } catch (error) {
      console.error("Error submitting foster application:", error);
      toast.error("Failed to submit application. Please try again.");
      setAppStatus('idle');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Foster a Friend</h1>
          <p className="text-slate-500">Provide a temporary home and endless love to an animal in transition.</p>
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

      {/* Benefits Section */}
      <div className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-purple-50 p-8 rounded-[2.5rem] border border-purple-100">
          <div className="bg-purple-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <Heart className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Saves Lives</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Fostering opens up space in our shelter for another animal in need, effectively saving two lives at once.</p>
        </div>
        <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100">
          <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Stress Reduction</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Shelters can be stressful. A home environment allows animals to relax and show their true personalities.</p>
        </div>
        <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100">
          <div className="bg-emerald-100 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
            <Info className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Better Adoption</h3>
          <p className="text-slate-600 text-sm leading-relaxed">Fosters provide valuable insight into how an animal behaves in a home, helping us find the perfect forever match.</p>
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
              <p className="text-slate-600 text-sm">Create an account or sign in to submit foster applications and help our residents find temporary homes.</p>
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
              <img src={animal.image} alt={animal.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
                   <Heart className="w-5 h-5" />
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
                Foster {animal.name}
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
              <X className="w-6 h-6 text-slate-600" />
            </button>
            
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2 h-[450px] md:h-auto">
                <img src={selectedAnimal.image} className="w-full h-full object-cover" alt={selectedAnimal.name} />
              </div>
              <div className="md:w-1/2 p-8 md:p-14">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-purple-100 text-purple-700 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">{selectedAnimal.type}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 font-bold">{selectedAnimal.breed}</span>
                </div>
                <h2 className="text-5xl font-black text-slate-900 mb-6">{selectedAnimal.name}</h2>
                
                <div className="mb-10">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">About {selectedAnimal.name}</h3>
                  <p className="text-slate-600 leading-relaxed italic border-l-4 border-purple-400 pl-4 bg-purple-50/20 py-4 rounded-r-2xl">
                    {animalBios[selectedAnimal.id] || selectedAnimal.description}
                  </p>
                </div>

                {!user ? (
                  <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl text-center">
                    <h3 className="text-xl font-black text-slate-900 mb-4 italic">Ready to Foster?</h3>
                    <p className="text-slate-500 mb-6 text-sm">You must be signed in to submit a foster application for {selectedAnimal.name}.</p>
                    <div className="flex flex-col gap-3">
                      <Link to="/auth" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-100 hover:bg-slate-800 transition-all">
                        Sign In to Foster
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
                      Apply to Foster {selectedAnimal.name}
                    </button>
                    <p className="text-center text-slate-400 text-[10px] mt-5 font-bold uppercase tracking-widest">Supplies provided by Vic's Animal Shelter</p>
                  </>
                ) : appStatus === 'success' ? (
                  <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-100">
                      < Heart className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-emerald-900 mb-2">Application Sent!</h3>
                    <p className="text-emerald-700 text-sm font-medium">Vic's staff will review your foster request and contact you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleAppSubmit} className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-bold text-slate-900">Foster Request</h3>
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
                    <input 
                      required
                      type="text" 
                      placeholder="Home Address" 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 ring-purple-100"
                      value={appFormData.address}
                      onChange={e => setAppFormData({...appFormData, address: e.target.value})}
                    />
                    <div className="grid grid-cols-3 gap-4">
                      <input 
                        required
                        type="text" 
                        placeholder="City" 
                        className="col-span-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl"
                        value={appFormData.city}
                        onChange={e => setAppFormData({...appFormData, city: e.target.value})}
                      />
                      <input 
                        required
                        type="text" 
                        placeholder="State" 
                        className="col-span-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl"
                        value={appFormData.state}
                        onChange={e => setAppFormData({...appFormData, state: e.target.value})}
                      />
                      <input 
                        required
                        type="text" 
                        placeholder="Zip" 
                        className="col-span-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl"
                        value={appFormData.zip}
                        onChange={e => setAppFormData({...appFormData, zip: e.target.value})}
                      />
                    </div>
                    <div className="flex items-center gap-4 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-sm font-bold text-slate-600">Other Pets?</span>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="otherPets" 
                            checked={appFormData.hasOtherPets === true}
                            onChange={() => setAppFormData({...appFormData, hasOtherPets: true})}
                            className="w-4 h-4 text-purple-600"
                          />
                          <span className="text-sm">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name="otherPets" 
                            checked={appFormData.hasOtherPets === false}
                            onChange={() => setAppFormData({...appFormData, hasOtherPets: false})}
                            className="w-4 h-4 text-purple-600"
                          />
                          <span className="text-sm">No</span>
                        </label>
                      </div>
                    </div>
                    <select 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl"
                      value={appFormData.fosterDuration}
                      onChange={e => setAppFormData({...appFormData, fosterDuration: e.target.value})}
                    >
                      <option value="Short-term (1-2 weeks)">Short-term (1-2 weeks)</option>
                      <option value="Medium-term (1-2 months)">Medium-term (1-2 months)</option>
                      <option value="Foster-to-adopt">Foster-to-adopt</option>
                      <option value="Until adopted">Until adopted</option>
                    </select>
                    <textarea 
                      required
                      placeholder="Briefly describe your experience with pets..." 
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl h-24 focus:ring-2 ring-purple-100"
                      value={appFormData.experience}
                      onChange={e => setAppFormData({...appFormData, experience: e.target.value})}
                    ></textarea>
                    <button 
                      type="submit" 
                      disabled={appStatus === 'submitting'}
                      className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all disabled:opacity-50"
                    >
                      {appStatus === 'submitting' ? 'Submitting...' : 'Submit Foster Application'}
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

export default Foster;
