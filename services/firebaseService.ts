import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  setDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { isFirebaseConfigured } from '../lib/firebase';
import { Animal, AdoptionApplication, User, VolunteerShift } from '../types';
import { MOCK_ANIMALS, MOCK_APPLICATIONS, MOCK_USERS, MOCK_SHIFTS } from '../constants';

const ANIMALS_COLLECTION = 'animals';
const APPLICATIONS_COLLECTION = 'applications';
const USERS_COLLECTION = 'users';
const SHIFTS_COLLECTION = 'shifts';

export const getUserProfile = async (uid: string): Promise<User | null> => {
  if (!isFirebaseConfigured) return null;
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const createUserProfile = async (uid: string, data: Partial<User>): Promise<void> => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(docRef, {
      role: 'user', // Default role
      ...data,
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error("Error creating user profile:", error);
  }
};

export const fetchAnimals = async (): Promise<Animal[]> => {
  if (!isFirebaseConfigured) return MOCK_ANIMALS;
  try {
    const querySnapshot = await getDocs(collection(db, ANIMALS_COLLECTION));
    const animals: Animal[] = [];
    querySnapshot.forEach((doc) => {
      animals.push({ id: doc.id, ...doc.data() } as Animal);
    });
    return animals.length > 0 ? animals : MOCK_ANIMALS;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Firestore permissions denied for 'animals'. Falling back to mock data.");
      return MOCK_ANIMALS;
    }
    throw error;
  }
};

export const fetchApplications = async (): Promise<AdoptionApplication[]> => {
  if (!isFirebaseConfigured) return MOCK_APPLICATIONS;
  try {
    const querySnapshot = await getDocs(collection(db, APPLICATIONS_COLLECTION));
    const applications: AdoptionApplication[] = [];
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() } as AdoptionApplication);
    });
    return applications.length > 0 ? applications : MOCK_APPLICATIONS;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Firestore permissions denied for 'applications'. Falling back to mock data.");
      return MOCK_APPLICATIONS;
    }
    throw error;
  }
};

export const fetchShifts = async (): Promise<VolunteerShift[]> => {
  if (!isFirebaseConfigured) return MOCK_SHIFTS;
  try {
    const querySnapshot = await getDocs(collection(db, SHIFTS_COLLECTION));
    const shifts: VolunteerShift[] = [];
    querySnapshot.forEach((doc) => {
      shifts.push({ id: doc.id, ...doc.data() } as VolunteerShift);
    });
    return shifts.length > 0 ? shifts : MOCK_SHIFTS;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Firestore permissions denied for 'shifts'. Falling back to mock data.");
      return MOCK_SHIFTS;
    }
    throw error;
  }
};

export const fetchUsers = async (): Promise<User[]> => {
  if (!isFirebaseConfigured) return MOCK_USERS;
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as User);
    });
    return users.length > 0 ? users : MOCK_USERS;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Firestore permissions denied for 'users'. Falling back to mock data.");
      return MOCK_USERS;
    }
    throw error;
  }
};

export const updateUserRole = async (id: string, role: User['role']): Promise<void> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  const docRef = doc(db, USERS_COLLECTION, id);
  await updateDoc(docRef, { role });
};

export const addAnimal = async (animal: Omit<Animal, 'id'>): Promise<string> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  const docRef = await addDoc(collection(db, ANIMALS_COLLECTION), animal);
  return docRef.id;
};

export const updateAnimal = async (id: string, animal: Partial<Animal>): Promise<void> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  const docRef = doc(db, ANIMALS_COLLECTION, id);
  await updateDoc(docRef, animal);
};

export const submitApplication = async (application: Omit<AdoptionApplication, 'id'>): Promise<string> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
    ...application,
    submittedAt: new Date().toISOString(),
    status: 'pending'
  });
  return docRef.id;
};

export const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  const docRef = doc(db, APPLICATIONS_COLLECTION, id);
  await updateDoc(docRef, { status });
};

// Helper to seed initial data if needed
export const seedInitialData = async () => {
  if (!isFirebaseConfigured) return;
  try {
    const animalsSnapshot = await getDocs(collection(db, ANIMALS_COLLECTION));
    if (animalsSnapshot.empty) {
      console.log('Seeding animals...');
      for (const animal of MOCK_ANIMALS) {
        const { id, ...data } = animal;
        await setDoc(doc(db, ANIMALS_COLLECTION, id), data);
      }
    }

    const appsSnapshot = await getDocs(collection(db, APPLICATIONS_COLLECTION));
    if (appsSnapshot.empty) {
      console.log('Seeding applications...');
      for (const app of MOCK_APPLICATIONS) {
        const { id, ...data } = app;
        await setDoc(doc(db, APPLICATIONS_COLLECTION, id), data);
      }
    }

    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    if (usersSnapshot.empty) {
      console.log('Seeding users...');
      for (const user of MOCK_USERS) {
        const { id, ...data } = user;
        await setDoc(doc(db, USERS_COLLECTION, id), data);
      }
    }

    const shiftsSnapshot = await getDocs(collection(db, SHIFTS_COLLECTION));
    if (shiftsSnapshot.empty) {
      console.log('Seeding shifts...');
      for (const shift of MOCK_SHIFTS) {
        const { id, ...data } = shift;
        await setDoc(doc(db, SHIFTS_COLLECTION, id), data);
      }
    }
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Firestore permissions denied during seeding. Skipping seed.");
      return;
    }
    throw error;
  }
};
