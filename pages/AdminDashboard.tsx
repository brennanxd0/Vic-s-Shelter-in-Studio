
import React, { useState, useEffect } from 'react';
import { User, Animal, AnimalType, AdoptionApplication, FosterApplication, VolunteerApplication, VolunteerShift } from '../types';
import { isAppropriateAnimal } from '../lib/safety';
import { 
  updateApplicationStatus, 
  addAnimal, 
  updateAnimal, 
  fetchUsers, 
  updateUserRole as updateUserRoleService,
  fetchFosterApplications,
  updateFosterApplicationStatus,
  updateAnimalStatus,
  fetchVolunteerApplications,
  updateVolunteerApplicationStatus,
  fetchShifts,
  addShift,
  updateShift,
  deleteShift
} from '../services/firebaseService';
import { auth } from '../lib/firebase';
import { toast } from 'sonner';
import { Users, Calendar, Package, FileText, RefreshCw, Plus, Edit2, Trash2, Check, X, Eye, Heart, History, RotateCcw, Search, Filter, Download } from 'lucide-react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminDashboardProps {
  animals: Animal[];
  setAnimals: React.Dispatch<React.SetStateAction<Animal[]>>;
  applications: AdoptionApplication[];
  setApplications: React.Dispatch<React.SetStateAction<AdoptionApplication[]>>;
  profile: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ animals, setAnimals, applications, setApplications, profile }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [fosterApps, setFosterApps] = useState<FosterApplication[]>([]);
  const [volunteerApps, setVolunteerApps] = useState<VolunteerApplication[]>([]);
  const [shifts, setShifts] = useState<VolunteerShift[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'volunteers' | 'inventory' | 'applications' | 'foster' | 'history' | 'shifts'>('users');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isShiftFormOpen, setIsShiftFormOpen] = useState(false);
  const [editingAnimalId, setEditingAnimalId] = useState<string | null>(null);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<AdoptionApplication | null>(null);
  const [selectedFosterApp, setSelectedFosterApp] = useState<FosterApplication | null>(null);
  const [selectedVolunteerApp, setSelectedVolunteerApp] = useState<VolunteerApplication | null>(null);
  const [shiftDateFilter, setShiftDateFilter] = useState('');
  const [shiftTypeFilter, setShiftTypeFilter] = useState('All');

  useEffect(() => {
    const loadData = async () => {
      const [usersData, fosterData, volunteerData, shiftsData] = await Promise.all([
        fetchUsers(),
        fetchFosterApplications(),
        fetchVolunteerApplications(),
        fetchShifts()
      ]);
      setUsers(usersData);
      setFosterApps(fosterData);
      setVolunteerApps(volunteerData);
      setShifts(shiftsData);
      setLoadingUsers(false);
    };
    loadData();
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

  const [shiftFormData, setShiftFormData] = useState<Partial<VolunteerShift>>({
    title: '',
    date: '',
    time: '',
    slots: 0,
    type: 'volunteer',
    description: ''
  });

  const pendingApps = applications.filter(app => app.status === 'pending');
  const pendingFosterApps = fosterApps.filter(app => app.status === 'pending');
  const pendingVolunteerApps = volunteerApps.filter(app => app.status === 'pending');

  const filteredShifts = shifts.filter(shift => {
    const matchesDate = !shiftDateFilter || shift.date === shiftDateFilter;
    const matchesType = shiftTypeFilter === 'All' || shift.type === shiftTypeFilter;
    return matchesDate && matchesType;
  });

  const shiftTypes = Array.from(new Set(shifts.map(s => s.type).filter(Boolean))) as string[];

  const updateUserRole = async (userId: string, newRole: User['role']) => {
    try {
      await updateUserRoleService(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole} successfully.`);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role.");
    }
  };

  const handleApplication = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const app = applications.find(a => a.id === id);
      await updateApplicationStatus(id, status);
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      
      if (status === 'approved' && app) {
        await updateAnimalStatus(app.animalId, 'adopted');
        setAnimals(prev => prev.map(a => a.id === app.animalId ? { ...a, status: 'adopted' } : a));
        toast.success(`Application approved and animal marked as adopted.`);
      } else {
        toast.success(`Application ${status} successfully.`);
      }

      if (selectedApp?.id === id) {
        setSelectedApp(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast.error("Failed to update application status.");
    }
  };

  const handleFosterApplication = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const app = fosterApps.find(a => a.id === id);
      await updateFosterApplicationStatus(id, status);
      setFosterApps(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      
      if (status === 'approved' && app) {
        await updateAnimalStatus(app.animalId, 'fostered');
        setAnimals(prev => prev.map(a => a.id === app.animalId ? { ...a, status: 'fostered' } : a));
        toast.success(`Foster application approved and animal marked as fostered.`);
      } else {
        toast.success(`Foster application ${status} successfully.`);
      }

      if (selectedFosterApp?.id === id) {
        setSelectedFosterApp(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error("Error updating foster application status:", error);
      toast.error("Failed to update foster application status.");
    }
  };

  const handleVolunteerApplication = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const app = volunteerApps.find(a => a.id === id);
      await updateVolunteerApplicationStatus(id, status);
      setVolunteerApps(prev => prev.map(app => app.id === id ? { ...app, status } : app));
      
      if (status === 'approved' && app) {
        // If approved, we might want to automatically update the user role to 'volunteer'
        await updateUserRoleService(app.userId, 'volunteer');
        setUsers(prev => prev.map(u => u.id === app.userId ? { ...u, role: 'volunteer' } : u));
        toast.success(`Volunteer application approved and user role updated to volunteer.`);
      } else {
        toast.success(`Volunteer application ${status} successfully.`);
      }

      if (selectedVolunteerApp?.id === id) {
        setSelectedVolunteerApp(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error("Error updating volunteer application status:", error);
      toast.error("Failed to update volunteer application status.");
    }
  };

  const restoreAnimal = async (id: string) => {
    try {
      await updateAnimalStatus(id, 'available');
      setAnimals(prev => prev.map(a => a.id === id ? { ...a, status: 'available' } : a));
      toast.success("Animal profile restored to available list.");
    } catch (error) {
      console.error("Error restoring animal:", error);
      toast.error("Failed to restore animal profile.");
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
        const dogImages = [
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=800'
        ];
        const catImages = [
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1513245535761-06642199ed15?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800'
        ];
        
        const currentAnimal = animals.find(a => a.id === editingAnimalId);
        const typeChanged = formData.type !== currentAnimal?.type;
        
        const newImage = typeChanged 
          ? (formData.type === AnimalType.DOG 
              ? dogImages[Math.floor(Math.random() * dogImages.length)] 
              : catImages[Math.floor(Math.random() * catImages.length)])
          : currentAnimal?.image;

        const updatedData = { 
          ...formData as Animal,
          image: newImage || ''
        };

        if (!isAppropriateAnimal({ ...updatedData, id: editingAnimalId, tags: updatedData.tags || [] })) {
          toast.error("The profile content (name, description, or image) appears to contain inappropriate keywords. Please focus on living, happy animals.");
          return;
        }
        
        await updateAnimal(editingAnimalId, updatedData);
        setAnimals(prev => prev.map(a => a.id === editingAnimalId ? { ...a, ...updatedData } : a));
        toast.success(`${updatedData.name}'s profile updated successfully.`);
      } else {
        const dogImages = [
          'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1507146426996-ef05306b995a?auto=format&fit=crop&q=80&w=800'
        ];
        const catImages = [
          'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1513245535761-06642199ed15?auto=format&fit=crop&q=80&w=800',
          'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800'
        ];

        const animalData: Omit<Animal, 'id'> = {
          ...formData as Animal,
          image: formData.type === AnimalType.DOG 
            ? dogImages[Math.floor(Math.random() * dogImages.length)] 
            : catImages[Math.floor(Math.random() * catImages.length)],
          tags: ['New Arrival']
        };

        if (!isAppropriateAnimal({ ...animalData, id: 'temp' } as Animal)) {
          toast.error("The profile content (name, description, or image) appears to contain inappropriate keywords. Please focus on living, happy animals.");
          return;
        }
        
        const newId = await addAnimal(animalData);
        setAnimals(prev => [{ ...animalData, id: newId }, ...prev]);
        toast.success(`${animalData.name} added to inventory successfully.`);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving animal:", error);
      toast.error("Failed to save animal profile.");
    }
  };

  const handleSubmitShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const finalShiftData = {
        ...shiftFormData,
        type: shiftFormData.type || 'volunteer',
        description: shiftFormData.description || ''
      };

      console.log("Submitting shift data:", {
        id: editingShiftId,
        data: finalShiftData,
        types: {
          title: typeof finalShiftData.title,
          date: typeof finalShiftData.date,
          time: typeof finalShiftData.time,
          slots: typeof finalShiftData.slots,
          description: typeof finalShiftData.description,
          type: typeof finalShiftData.type
        }
      });

      if (editingShiftId) {
        await updateShift(editingShiftId, finalShiftData);
        setShifts(prev => prev.map(s => s.id === editingShiftId ? { ...s, ...finalShiftData } : s));
        toast.success("Shift updated successfully.");
      } else {
        const newId = await addShift(finalShiftData as Omit<VolunteerShift, 'id'>);
        setShifts(prev => [{ ...finalShiftData as VolunteerShift, id: newId }, ...prev]);
        toast.success("Shift added successfully.");
      }
      resetShiftForm();
    } catch (error) {
      console.error("Error saving shift:", error);
      toast.error("Failed to save shift.");
    }
  };

  const handleDeleteShift = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shift?")) return;
    try {
      await deleteShift(id);
      setShifts(prev => prev.filter(s => s.id !== id));
      toast.success("Shift deleted successfully.");
    } catch (error) {
      console.error("Error deleting shift:", error);
      toast.error("Failed to delete shift.");
    }
  };

  const startEditingShift = (shift: VolunteerShift) => {
    setEditingShiftId(shift.id);
    setShiftFormData({
      title: shift.title,
      date: shift.date,
      time: shift.time,
      slots: shift.slots,
      type: shift.type || 'volunteer',
      description: shift.description || ''
    });
    setIsShiftFormOpen(true);
  };

  const resetShiftForm = () => {
    setIsShiftFormOpen(false);
    setEditingShiftId(null);
    setShiftFormData({ title: '', date: '', time: '', slots: 0, type: 'volunteer', description: '' });
  };

  const getRoleBadgeColor = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'staff': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'volunteer': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getAnimalName = (id: string) => animals.find(a => a.id === id)?.name || "Unknown Pet";
  const getAnimalImage = (id: string) => animals.find(a => a.id === id)?.image || "";

  const handleSyncData = async () => {
    if (!confirm("This will overwrite existing Firestore data with mock data. Continue?")) return;
    
    const syncPromise = (async () => {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Authentication required");

      const response = await fetch('/api/admin/seed-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Sync failed");
      }
      
      const result = await response.json();
      return result.message;
    })();

    toast.promise(syncPromise, {
      loading: 'Syncing mock data to Firestore...',
      success: (message) => {
        setTimeout(() => window.location.reload(), 1500);
        return message;
      },
      error: (err: any) => `Sync failed: ${err.message}`,
    });
  };

  const generatePDFReport = async () => {
    try {
      const doc = new jsPDF() as any;
      const today = new Date();
      const last30Days = new Date();
      last30Days.setDate(today.getDate() - 30);

      // Header
      doc.setFontSize(22);
      doc.setTextColor(126, 34, 206); // bg-purple-700 hex equivalentish
      doc.text("Vic's Animal Shelter - Monthly Report", 20, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, 20, 30);
      doc.text(`Reporting Period: ${last30Days.toLocaleDateString()} to ${today.toLocaleDateString()}`, 20, 36);

      // 1. Inventory Information
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text("1. Animal Inventory", 20, 50);
      
      const [inventoryData, combinedApps, shiftData] = await (async () => {
        const inv = animals.map(a => [
          a.name,
          a.type,
          a.breed,
          a.gender,
          a.status || 'Available'
        ]);

        const filterLast30Days = (submittedAt: string) => {
          const date = new Date(submittedAt);
          return date >= last30Days;
        };

        const combined = [
          ...applications.filter(a => filterLast30Days(a.submittedAt)).map(a => [
            a.applicantName, 'Adoption', a.status, new Date(a.submittedAt).toLocaleDateString()
          ]),
          ...fosterApps.filter(a => filterLast30Days(a.submittedAt)).map(a => [
            a.applicantName, 'Foster', a.status, new Date(a.submittedAt).toLocaleDateString()
          ]),
          ...volunteerApps.filter(a => filterLast30Days(a.submittedAt)).map(a => [
            a.applicantName, 'Volunteer', a.status, new Date(a.submittedAt).toLocaleDateString()
          ])
        ];

        const shiftsList = shifts.map(s => {
          const claimedByCount = s.claimedBy ? s.claimedBy.length : 0;
          const volunteerNames = s.claimedBy ? 
            s.claimedBy.map(uid => users.find(u => u.id === uid)?.name || 'Unknown').join(', ') : 
            'None';
          
          return [
            s.title,
            s.date,
            s.time,
            `${claimedByCount}/${s.slots}`,
            volunteerNames
          ];
        });

        return [inv, combined, shiftsList];
      })();

      autoTable(doc, {
        startY: 55,
        head: [['Name', 'Type', 'Breed', 'Gender', 'Status']],
        body: inventoryData,
        headStyles: { fillColor: [126, 34, 206] },
        alternateRowStyles: { fillColor: [249, 245, 255] }
      });

      // 2. Applications (Adoption, Foster, Volunteer) - Last 30 Days
      const nextStartY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(16);
      doc.text("2. Applications (Last 30 Days)", 20, nextStartY);

      autoTable(doc, {
        startY: nextStartY + 5,
        head: [['Applicant', 'Type', 'Status', 'Date Submitted']],
        body: combinedApps.length > 0 ? combinedApps : [['No applications in this period', '-', '-', '-']],
        headStyles: { fillColor: [79, 70, 229] }, // bg-indigo-600
        alternateRowStyles: { fillColor: [245, 247, 255] }
      });

      // 3. Shifts & Volunteers
      const shiftsStartY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(16);
      doc.text("3. Shifts & Volunteers", 20, shiftsStartY);

      autoTable(doc, {
        startY: shiftsStartY + 5,
        head: [['Shift', 'Date', 'Time', 'Sign-ups', 'Volunteers']],
        body: shiftData.length > 0 ? shiftData : [['No shifts scheduled', '-', '-', '-', '-']],
        headStyles: { fillColor: [5, 150, 105] }, // bg-emerald-600
        alternateRowStyles: { fillColor: [240, 253, 244] }
      });

      // 4. Donations (Blank Section)
      const donationsStartY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(16);
      doc.text("4. Donations", 20, donationsStartY);
      
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("(Section intentionally left blank for manual auditing)", 20, donationsStartY + 8);

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
        doc.text("Confidential Shelter Record - Vic's Animal Shelter", 20, doc.internal.pageSize.height - 10);
      }

      doc.save(`shelter_report_${today.toISOString().split('T')[0]}.pdf`);
      toast.success("Report generated and downloaded successfully.");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF report.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Vic's Control Center</h1>
          <p className="text-slate-500 font-medium">Manage your shelter community, animal inventory, and adoptions.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={generatePDFReport}
            className="px-4 py-2 bg-purple-600 text-white text-xs font-black rounded-xl hover:bg-purple-700 transition-all uppercase tracking-widest flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Generate Report
          </button>
          <button 
            onClick={handleSyncData}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Sync Mock Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Members', value: users.length, icon: Users, color: 'blue' },
          { label: 'Staff Members', value: users.filter(u => u.role === 'staff').length, icon: Check, color: 'emerald' },
          { label: 'Animals Hosted', value: animals.length, icon: Package, color: 'purple' },
          { 
            label: 'Pending Apps', 
            value: pendingApps.length, 
            icon: FileText, 
            color: 'indigo' 
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm shadow-slate-50 hover:shadow-md transition-all">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-${stat.color}-50 text-${stat.color}-600 shadow-inner`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-black text-slate-900">{stat.value}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="relative flex flex-wrap bg-slate-100/50 p-1.5 rounded-[1.5rem] mb-10 w-fit shadow-inner border border-slate-200/50 backdrop-blur-sm">
        {[
          { id: 'users', label: 'User Roles', icon: Users },
          { id: 'inventory', label: 'Inventory', icon: Package },
          { id: 'applications', label: 'Adoptions', icon: FileText, count: pendingApps.length },
          { id: 'foster', label: 'Foster Apps', icon: Heart, count: pendingFosterApps.length },
          { id: 'volunteers', label: 'Volunteer Apps', icon: Calendar, count: pendingVolunteerApps.length },
          { id: 'shifts', label: 'Manage Shifts', icon: Calendar },
          { id: 'history', label: 'History', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2.5 z-10 ${
                isActive ? 'text-purple-700' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-sm border border-purple-100"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={`w-4 h-4 relative z-20 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />
              <span className="relative z-20">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`relative z-20 ml-1 px-2 py-0.5 text-[10px] rounded-full ${
                  isActive ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
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
                          disabled={profile?.role === 'staff' && (user.role === 'staff' || user.role === 'admin')}
                          onChange={(e) => updateUserRole(user.id, e.target.value as any)}
                          className="text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 ring-purple-100 focus:outline-none transition-all disabled:opacity-50"
                        >
                          <option value="basicUser">Basic User</option>
                          <option value="volunteer">Volunteer</option>
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

      {activeTab === 'volunteers' && (
        <div className="space-y-8">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Applicant</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {volunteerApps.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-medium">No volunteer applications found.</td>
                    </tr>
                  ) : (
                    volunteerApps.map(app => (
                      <tr key={app.id} className="hover:bg-purple-50/10 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                              {app.applicantName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-slate-900 font-bold">{app.applicantName}</div>
                              <div className="text-slate-500 text-xs">{app.applicantEmail}</div>
                            </div>
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
                              onClick={() => setSelectedVolunteerApp(app)}
                              className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 uppercase tracking-widest"
                            >
                              View
                            </button>
                            {app.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleVolunteerApplication(app.id, 'approved')}
                                  className="px-4 py-2 bg-purple-600 text-white text-xs font-black rounded-xl hover:bg-purple-700 transition-all shadow-md shadow-purple-50 uppercase tracking-widest"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleVolunteerApplication(app.id, 'rejected')}
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
              {isFormOpen && !editingAnimalId ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
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
                  {animals.filter(a => !a.status || a.status === 'available').map(animal => (
                    <tr key={animal.id} className={`hover:bg-purple-50/10 transition-colors ${editingAnimalId === animal.id ? 'bg-purple-50/50' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <img src={animal.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt={animal.name} referrerPolicy="no-referrer" />
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
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => removeAnimal(animal.id)}
                            className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Remove from list"
                          >
                            <Trash2 className="w-5 h-5" />
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

      {activeTab === 'foster' && (
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
                  {fosterApps.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">No foster applications found.</td>
                    </tr>
                  ) : (
                    fosterApps.map(app => (
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
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
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
                              onClick={() => setSelectedFosterApp(app)}
                              className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-black rounded-xl hover:bg-slate-100 transition-colors border border-slate-100 uppercase tracking-widest"
                            >
                              View
                            </button>
                            {app.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleFosterApplication(app.id, 'approved')}
                                  className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-50 uppercase tracking-widest"
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleFosterApplication(app.id, 'rejected')}
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

      {activeTab === 'history' && (
        <div className="space-y-8">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Animal</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {animals.filter(a => a.status === 'fostered' || a.status === 'adopted').length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-8 py-12 text-center text-slate-400 font-medium">No archived animal profiles found.</td>
                    </tr>
                  ) : (
                    animals.filter(a => a.status === 'fostered' || a.status === 'adopted').map(animal => (
                      <tr key={animal.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <img src={animal.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm grayscale opacity-60" alt={animal.name} referrerPolicy="no-referrer" />
                            <div>
                              <div className="text-slate-900 font-bold">{animal.name}</div>
                              <div className="text-slate-400 text-[10px] uppercase font-black tracking-widest">{animal.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            animal.status === 'fostered' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {animal.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => restoreAnimal(animal.id)}
                            className="px-4 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 ml-auto uppercase tracking-widest"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Restore Profile
                          </button>
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

      {activeTab === 'shifts' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-xl font-black text-slate-900">Volunteer Shifts</h2>
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="date" 
                  value={shiftDateFilter}
                  onChange={(e) => setShiftDateFilter(e.target.value)}
                  className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 ring-purple-100 w-full"
                />
              </div>
              <div className="relative flex-1 md:flex-none">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select 
                  value={shiftTypeFilter}
                  onChange={(e) => setShiftTypeFilter(e.target.value)}
                  className="pl-11 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 ring-purple-100 appearance-none w-full"
                >
                  <option value="All">All Types</option>
                  {shiftTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              {(shiftDateFilter || shiftTypeFilter !== 'All') && (
                <button 
                  onClick={() => { setShiftDateFilter(''); setShiftTypeFilter('All'); }}
                  className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                  title="Clear Filters"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => setIsShiftFormOpen(true)}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-black shadow-lg shadow-purple-100 hover:bg-purple-700 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Shift
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Shift Details</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Date & Time</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Slots</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredShifts.length > 0 ? (
                    filteredShifts.map(shift => (
                      <tr key={shift.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-8 py-6">
                          <div className="font-bold text-slate-900">{shift.title}</div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-purple-100">
                            {shift.type || 'General'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-sm text-slate-600 font-medium">{shift.date}</div>
                          <div className="text-xs text-slate-400">{shift.time}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                            {shift.slots} Slots Available
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => startEditingShift(shift)}
                              className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteShift(shift.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-bold">No shifts found matching your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Adoption Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button 
              onClick={() => setSelectedApp(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
            >
              <X className="w-6 h-6 text-slate-600" />
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
                      <img src={getAnimalImage(selectedApp.animalId)} className="w-14 h-14 rounded-xl object-cover shadow-sm" alt="" referrerPolicy="no-referrer" />
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
      {/* Foster Application Detail Modal */}
      {selectedFosterApp && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button 
              onClick={() => setSelectedFosterApp(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
            
            <div className="p-8 md:p-14">
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-20 h-20 rounded-[1.75rem] bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100">
                   {selectedFosterApp.applicantName.charAt(0)}
                 </div>
                 <div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedFosterApp.applicantName}</h2>
                   <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Foster Application ID: {selectedFosterApp.id.toUpperCase()}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 border-t border-slate-50 pt-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Interested In Fostering</h4>
                    <div className="flex items-center gap-4 bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50">
                      <img src={getAnimalImage(selectedFosterApp.animalId)} className="w-14 h-14 rounded-xl object-cover shadow-sm" alt="" referrerPolicy="no-referrer" />
                      <div>
                        <div className="font-bold text-slate-900 text-lg">{getAnimalName(selectedFosterApp.animalId)}</div>
                        <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Vic's Resident</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact Info</h4>
                    <p className="text-slate-900 font-bold">{selectedFosterApp.applicantEmail}</p>
                    <p className="text-slate-500 text-sm">{selectedFosterApp.address}, {selectedFosterApp.city}, {selectedFosterApp.state} {selectedFosterApp.zip}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      selectedFosterApp.status === 'pending' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      selectedFosterApp.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {selectedFosterApp.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Other Pets / Duration</h4>
                    <p className="text-slate-900 font-bold">{selectedFosterApp.hasOtherPets ? 'Has other pets' : 'No other pets'}</p>
                    <p className="text-slate-500 text-sm">{selectedFosterApp.fosterDuration}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 mb-10">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Experience</h4>
                <p className="text-slate-700 leading-relaxed italic text-sm">
                  "{selectedFosterApp.experience || "No experience details provided."}"
                </p>
              </div>

              {selectedFosterApp.status === 'pending' && (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleFosterApplication(selectedFosterApp.id, 'approved')}
                    className="py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest text-sm"
                  >
                    Approve Foster
                  </button>
                  <button 
                    onClick={() => handleFosterApplication(selectedFosterApp.id, 'rejected')}
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
      {/* Volunteer Application Detail Modal */}
      {selectedVolunteerApp && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button 
              onClick={() => setSelectedVolunteerApp(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
            
            <div className="p-8 md:p-14">
              <div className="flex items-center gap-6 mb-10">
                 <div className="w-20 h-20 rounded-[1.75rem] bg-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-purple-100">
                   {selectedVolunteerApp.applicantName.charAt(0)}
                 </div>
                 <div>
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedVolunteerApp.applicantName}</h2>
                   <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Volunteer Application ID: {selectedVolunteerApp.id.toUpperCase()}</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 border-t border-slate-50 pt-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Contact</h4>
                    <p className="text-slate-900 font-bold">{selectedVolunteerApp.applicantEmail}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</h4>
                    <p className="text-slate-900 font-bold">{selectedVolunteerApp.phoneNumber || "Not provided"}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</h4>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      selectedVolunteerApp.status === 'pending' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      selectedVolunteerApp.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                      'bg-red-50 text-red-700 border-red-100'
                    }`}>
                      {selectedVolunteerApp.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Availability</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedVolunteerApp.availability && selectedVolunteerApp.availability.length > 0 ? (
                        selectedVolunteerApp.availability.map(day => (
                          <span key={day} className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded-md border border-purple-100">
                            {day}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-400 text-xs italic">No days selected</p>
                      )}
                    </div>
                    {selectedVolunteerApp.availabilityTimes && (
                      <p className="mt-2 text-slate-600 text-xs font-medium">
                        <span className="text-slate-400 uppercase text-[9px] font-black mr-1">Times:</span>
                        {selectedVolunteerApp.availabilityTimes}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8 mb-10">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Motivation Statement</h4>
                  <p className="text-slate-700 leading-relaxed italic text-sm">
                    "{selectedVolunteerApp.reason || "No motivation statement provided."}"
                  </p>
                </div>

                <div className="bg-purple-50/30 p-8 rounded-[2rem] border border-purple-100/50">
                  <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">Skills & Experience</h4>
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {selectedVolunteerApp.skills || "No skills or experience details provided."}
                  </p>
                </div>

                {selectedVolunteerApp.emergencyContact && (
                  <div className="bg-red-50/30 p-8 rounded-[2rem] border border-red-100/50">
                    <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Emergency Contact</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Name</p>
                        <p className="text-slate-900 font-bold text-sm">{selectedVolunteerApp.emergencyContact.name}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Phone</p>
                        <p className="text-slate-900 font-bold text-sm">{selectedVolunteerApp.emergencyContact.phone}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Relationship</p>
                        <p className="text-slate-900 font-bold text-sm">{selectedVolunteerApp.emergencyContact.relationship}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedVolunteerApp.status === 'pending' && (
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleVolunteerApplication(selectedVolunteerApp.id, 'approved')}
                    className="py-5 bg-purple-600 text-white font-black rounded-2xl hover:bg-purple-700 transition-all shadow-xl shadow-purple-100 uppercase tracking-widest text-sm"
                  >
                    Approve Volunteer
                  </button>
                  <button 
                    onClick={() => handleVolunteerApplication(selectedVolunteerApp.id, 'rejected')}
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
      {/* Shift Form Modal */}
      {isShiftFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] max-w-lg w-full p-8 md:p-14 relative shadow-2xl">
            <button 
              onClick={resetShiftForm}
              className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X className="w-6 h-6 text-slate-600" />
            </button>
            <h2 className="text-3xl font-black text-slate-900 mb-8 italic">
              {editingShiftId ? 'Edit Shift' : 'Add New Shift'}
            </h2>
            <form onSubmit={handleSubmitShift} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Shift Title</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100" 
                  placeholder="Morning Dog Walking" 
                  value={shiftFormData.title}
                  onChange={e => setShiftFormData({...shiftFormData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Date</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100" 
                    value={shiftFormData.date}
                    onChange={e => setShiftFormData({...shiftFormData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Time Range</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100" 
                    placeholder="8:00 AM - 11:00 AM" 
                    value={shiftFormData.time}
                    onChange={e => setShiftFormData({...shiftFormData, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Available Slots</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100" 
                    value={shiftFormData.slots}
                    onChange={e => setShiftFormData({...shiftFormData, slots: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Shift Type</label>
                  <select 
                    required
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100"
                    value={shiftFormData.type}
                    onChange={e => setShiftFormData({...shiftFormData, type: e.target.value as 'volunteer' | 'staff'})}
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 tracking-widest">Description</label>
                <textarea 
                  required 
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 ring-purple-100 h-24" 
                  placeholder="Help with morning dog walking and kennel cleaning..." 
                  value={shiftFormData.description}
                  onChange={e => setShiftFormData({...shiftFormData, description: e.target.value})}
                ></textarea>
              </div>
              <button 
                type="submit" 
                className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black shadow-xl shadow-purple-100 hover:bg-purple-700 transition-all"
              >
                {editingShiftId ? 'Update Shift' : 'Create Shift'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
