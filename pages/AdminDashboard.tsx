
import React, { useState, useEffect } from 'react';
import { User, Animal, AnimalType, AdoptionApplication } from '../types.ts';
import { updateApplicationStatus, addAnimal, updateAnimal, fetchUsers, updateUserRole as updateUserRoleService } from '../services/firebaseService';

interface AdminDashboardProps {
  animals: Animal[];
  setAnimals: React.Dispatch<React.SetStateAction<Animal[]>>;
  applications: AdoptionApplication[];
  setApplications: React.Dispatch<React.SetStateAction<AdoptionApplication[]>>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ animals, setAnimals, applications, setApplications }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'volunteers' | 'inventory' | 'applications'>('users');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAnimalId, setEditingAnimalId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<AdoptionApplication | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      const data = await fetchUsers();
      setUsers(data);
      setLoadingUsers(false);
    };
    loadUsers();
  }, []);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Animal>>({
    name: '',
    type: AnimalType.DOG,
    breed: '',
    age: '',
    gender: 'Female',
    description: '',
    tags: []
  });

  const pendingApps = applications.filter(app => app.status === 'pending');

  const updateUserRole = async (userId: string, newRole: User['role']) => {
    try {
      await updateUserRoleService(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update user role.");
    }
  };

  const handleApplication = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateApplicationStatus(id, status);
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      alert("Failed to update application status.");
    }
  };

  const removeAnimal = (id: string) => {
    if (confirm('Are you sure you want to remove this animal from the adoption list?')) {
      setAnimals(prev => prev.filter(a => a.id !== id));
      if (editingAnimalId === id) resetForm();
    }
  };

  const startEditing = (animal: Animal) => {
    setEditingAnimalId(animal.id);
    setFormData({
      name: animal.name,
      type: animal.type,
      breed: animal.breed,
      age: animal.age,
      gender: animal.gender,
      description: animal.description,
      tags: animal.tags
    });
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setEditingAnimalId(null);
    setFormData({ name: '', type: AnimalType.DOG, breed: '', age: '', gender: 'Female', description: '', tags: [] });
  };

  const handleSubmitAnimal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingAnimalId) {
        const updatedData = { 
          ...formData as Animal,
          image: formData.type !== animals.find(a => a.id === editingAnimalId)?.type ? `https://loremflickr.com/800/600/${formData.type === AnimalType.DOG ? 'dog' : 'cat'}?lock=${Math.floor(Math.random() * 1000)}` : animals.find(a => a.id === editingAnimalId)?.image
        };
        await updateAnimal(editingAnimalId, updatedData);
        setAnimals(prev => prev.map(a => a.id === editingAnimalId ? { ...a, ...updatedData } : a));
      } else {
        const lockSeed = Math.floor(Math.random() * 1000);
        const animalData: Omit<Animal, 'id'> = {
          ...formData as Animal,
          image: `https://loremflickr.com/800/600/${formData.type === AnimalType.DOG ? 'dog' : 'cat'}?lock=${lockSeed}`,
          tags: ['New Arrival']
        };
        const newId = await addAnimal(animalData);
        setAnimals(prev => [{ ...animalData, id: newId }, ...prev]);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving animal:", error);
      alert("Failed to save animal profile.");
    }
  };

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'staff': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAnimalName = (id: string) => animals.find(a => a.id === id)?.name || "Unknown Pet";
  const getAnimalImage = (id: string) => animals.find(a => a.id === id)?.image || "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Vic's Control Center</h1>
        <p className="text-slate-500 font-medium">Manage your shelter community, animal inventory, and adoptions.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Members', value: users.length, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', color: 'blue' },
          { label: 'Staff Members', value: users.filter(u => u.role === 'staff').length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'emerald' },
          { label: 'Animals Hosted', value: animals.length, icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', color: 'purple' },
          { 
            label: 'Pending Apps', 
            value: pendingApps.length, 
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', 
            color: 'indigo' 
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-50 hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${stat.color}-50 text-${stat.color}-600 shadow-inner`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon}/></svg>
            </div>
            <div className="text-2xl font-black text-slate-900">{stat.value}</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-[1.25rem] mb-8 w-fit shadow-inner">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 md:px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-white text-purple-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >User Roles</button>
        <button 
          onClick={() => setActiveTab('volunteers')}
          className={`px-6 md:px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'volunteers' ? 'bg-white text-purple-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >Staff</button>
        <button 
          onClick={() => setActiveTab('inventory')}
          className={`px-6 md:px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'inventory' ? 'bg-white text-purple-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >Inventory</button>
        <button 
          onClick={() => setActiveTab('applications')}
          className={`px-6 md:px-8 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'applications' ? 'bg-white text-purple-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >Adoptions {pendingApps.length > 0 && <span className="ml-2 px-2 py-0.5 bg-purple-600 text-white text-[10px] rounded-full">{pendingApps.length}</span>}</button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Loading users...</td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 shadow-inner">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-slate-900 font-bold">{user.name}</div>
                            <div className="text-slate-500 text-xs font-medium">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <select 
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                          className="text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 ring-purple-100 focus:outline-none transition-all"
                        >
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-medium">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-slate-900">Manage Animal Profiles</h3>
            <button 
              onClick={() => {
                if (isFormOpen && !editingAnimalId) setIsFormOpen(false);
                else {
                  resetForm();
                  setIsFormOpen(true);
                }
              }}
              className={`px-6 py-2.5 ${isFormOpen && !editingAnimalId ? 'bg-slate-200 text-slate-700' : 'bg-purple-600 text-white'} font-black text-sm rounded-xl shadow-lg shadow-purple-50 hover:opacity-90 transition-all flex items-center gap-2`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isFormOpen && !editingAnimalId ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"}/></svg>
              {isFormOpen && !editingAnimalId ? 'Close Form' : 'Add New Animal'}
            </button>
          </div>

          {isFormOpen && (
            <div className={`bg-white border-2 ${editingAnimalId ? 'border-purple-300 ring-4 ring-purple-50' : 'border-slate-50'} rounded-[3rem] p-10 shadow-xl transition-all`}>
              <div className="flex justify-between items-center mb-8">
                <h4 className="text-xl font-black italic">{editingAnimalId ? `Editing Profile: ${formData.name}` : 'New Animal Entry'}</h4>
                {editingAnimalId && (
                  <button onClick={resetForm} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">Discard Changes</button>
                )}
              </div>
              <form onSubmit={handleSubmitAnimal} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 ring-purple-100" placeholder="e.g. Buddy" />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as AnimalType})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <option value={AnimalType.DOG}>Dog</option>
                    <option value={AnimalType.CAT}>Cat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Breed</label>
                  <input required value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 ring-purple-100" placeholder="e.g. Lab Mix" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 focus:ring-2 ring-purple-100" placeholder="Tell us their story..."></textarea>
                </div>
                <button type="submit" className={`md:col-span-3 py-5 ${editingAnimalId ? 'bg-purple-600' : 'bg-slate-900'} text-white font-black text-lg rounded-[1.5rem] shadow-xl hover:opacity-95 transition-all active:scale-[0.99]`}>
                  {editingAnimalId ? 'Update Profile' : 'Publish Profile'}
                </button>
              </form>
            </div>
          )}

          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Animal</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Breed</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {animals.map(animal => (
                    <tr key={animal.id} className={`hover:bg-purple-50/10 transition-colors ${editingAnimalId === animal.id ? 'bg-purple-50/50' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={animal.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt={animal.name} />
                          <div>
                            <div className="text-slate-900 font-bold">{animal.name}</div>
                            <div className="text-purple-500 text-[10px] uppercase font-black tracking-widest">{animal.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-slate-600 text-sm font-medium">{animal.breed}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => startEditing(animal)}
                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                            title="Edit profile"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                          </button>
                          <button 
                            onClick={() => removeAnimal(animal.id)}
                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Remove from list"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-8">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Applicant</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Interested In</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {applications.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">No adoption applications found.</td>
                    </tr>
                  ) : (
                    applications.map(app => (
                      <tr key={app.id} className="hover:bg-purple-50/10 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                              {app.applicantName.charAt(0)}
                            </div>
                            <div className="text-slate-900 font-bold">{app.applicantName}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-slate-600 font-medium flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                            {getAnimalName(app.animalId)}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                            app.status === 'pending' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                            app.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                            'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setSelectedApp(app)}
                              className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 uppercase tracking-widest"
                            >
                              View
                            </button>
                            {app.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleApplication(app.id, 'approved')}
                                  className="px-4 py-2 bg-purple-600 text-white text-xs font-black rounded-xl hover:bg-purple-700 transition-all shadow-md shadow-purple-50 uppercase tracking-widest"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleApplication(app.id, 'rejected')}
                                  className="px-4 py-2 bg-slate-100 text-slate-400 text-xs font-black rounded-xl hover:text-red-600 hover:bg-red-50 transition-all uppercase tracking-widest"
                                >
                                  Deny
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button 
              onClick={() => setSelectedApp(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
            >
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="p-8 md:p-14">
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-20 h-20 rounded-[1.75rem] bg-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-purple-100">
                   {selectedApp.applicantName.charAt(0)}
                 </div>
                 <div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedApp.applicantName}</h2>
                   <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Adoption Application ID: {selectedApp.id.toUpperCase()}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 border-t border-slate-50 pt-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Interested In</h4>
                    <div className="flex items-center gap-4 bg-purple-50/30 p-4 rounded-2xl border border-purple-100/50">
                      <img src={getAnimalImage(selectedApp.animalId)} className="w-14 h-14 rounded-xl object-cover shadow-sm" alt="" />
                      <div>
                        <div className="font-bold text-slate-900 text-lg">{getAnimalName(selectedApp.animalId)}</div>
                        <div className="text-[10px] text-purple-600 font-black uppercase tracking-widest">Vic's Resident</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Contact</h4>
                    <p className="text-slate-900 font-bold">{selectedApp.applicantEmail || 'Not Provided'}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      selectedApp.status === 'pending' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      selectedApp.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {selectedApp.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Other Pets in Home</h4>
                    <p className="text-slate-900 font-bold">{selectedApp.hasOtherPets ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Home Environment</h4>
                    <p className="text-slate-900 font-bold">{selectedApp.homeType || 'House'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Motivation Statement</h4>
                <p className="text-slate-700 leading-relaxed italic text-sm">
                  "{selectedApp.reason || "The applicant didn't provide a specific reason, but expressed general interest in this animal."}"
                </p>
              </div>

              {selectedApp.status === 'pending' && (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleApplication(selectedApp.id, 'approved')}
                    className="py-5 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 uppercase tracking-widest text-sm"
                  >
                    Approve Request
                  </button>
                  <button 
                    onClick={() => handleApplication(selectedApp.id, 'rejected')}
                    className="py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 uppercase tracking-widest text-sm"
                  >
                    Deny Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
