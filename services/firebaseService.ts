import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  query, 
  where, 
  setDoc,
  getDoc,
  runTransaction,
  getDocFromServer
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { isFirebaseConfigured } from '../lib/firebase';
import { Animal, AdoptionApplication, FosterApplication, User, VolunteerShift, VolunteerApplication } from '../types';
import { MOCK_ANIMALS, MOCK_APPLICATIONS, MOCK_USERS, MOCK_SHIFTS } from '../constants';

const ANIMALS_COLLECTION = 'animals';
const APPLICATIONS_COLLECTION = 'applications';
const FOSTER_APPLICATIONS_COLLECTION = 'foster_applications';
const VOLUNTEER_APPLICATIONS_COLLECTION = 'volunteer_applications';
const USERS_COLLECTION = 'users';
const SHIFTS_COLLECTION = 'shifts';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const syncUserProfile = async (): Promise<User | null> => {
  if (!isFirebaseConfigured) return null;
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  try {
    const idToken = await currentUser.getIdToken();
    const response = await fetch('/api/auth/sync-profile', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error("Failed to sync profile");
    return await response.json();
  } catch (error) {
    console.error("Error syncing user profile:", error);
    return null;
  }
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  if (!isFirebaseConfigured) return null;
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    }
    return null;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied fetching user profile. This is likely due to Firestore security rules.");
      return null;
    }
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const createUserProfile = async (uid: string, data: Partial<User>): Promise<void> => {
  if (!isFirebaseConfigured) return;
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(docRef, {
      role: 'basicUser', // Default role
      ...data,
      createdAt: new Date().toISOString()
    }, { merge: true });
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.WRITE, `${USERS_COLLECTION}/${uid}`);
    }
    console.error("Error creating user profile:", error);
  }
};

export const updateUserProfile = async (uid: string, data: Partial<User>): Promise<void> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, data);
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.UPDATE, `${USERS_COLLECTION}/${uid}`);
    }
    throw error;
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
      // Quietly return mock data for unauthorized users
      return MOCK_APPLICATIONS;
    }
    throw error;
  }
};

let MOCK_SHIFTS_STATE: VolunteerShift[] = [...MOCK_SHIFTS];

export const fetchShifts = async (): Promise<VolunteerShift[]> => {
  if (!isFirebaseConfigured) return MOCK_SHIFTS_STATE;
  try {
    const querySnapshot = await getDocs(collection(db, SHIFTS_COLLECTION));
    const shifts: VolunteerShift[] = [];
    querySnapshot.forEach((doc) => {
      shifts.push({ id: doc.id, ...doc.data() } as VolunteerShift);
    });
    return shifts.length > 0 ? shifts : MOCK_SHIFTS_STATE;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      return MOCK_SHIFTS_STATE;
    }
    throw error;
  }
};

export const addShift = async (shift: Omit<VolunteerShift, 'id'>): Promise<string> => {
  if (!isFirebaseConfigured) {
    const newShift = { ...shift, id: `mock-shift-${Date.now()}`, updatedAt: new Date().toISOString() };
    MOCK_SHIFTS_STATE.push(newShift as any);
    return newShift.id;
  }
  try {
    const docRef = await addDoc(collection(db, SHIFTS_COLLECTION), {
      ...shift,
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.CREATE, SHIFTS_COLLECTION);
    }
    throw error;
  }
};

export const updateShift = async (id: string, shift: Partial<VolunteerShift>): Promise<void> => {
  console.log(`Updating shift ${id} with data:`, shift);
  if (!isFirebaseConfigured) {
    MOCK_SHIFTS_STATE = MOCK_SHIFTS_STATE.map(s => s.id === id ? { ...s, ...shift, updatedAt: new Date().toISOString() } : s);
    return;
  }
  try {
    const docRef = doc(db, SHIFTS_COLLECTION, id);
    const updateData = {
      ...shift,
      updatedAt: new Date().toISOString()
    };
    console.log("Final update payload:", updateData);
    await updateDoc(docRef, updateData);
  } catch (error: any) {
    console.error("Error in updateShift:", error);
    if (error.code === 'permission-denied') {
      handleFirestoreError(error, OperationType.UPDATE, `${SHIFTS_COLLECTION}/${id}`);
    }
    throw error;
  }
};

export const deleteShift = async (id: string): Promise<void> => {
  if (!isFirebaseConfigured) {
    MOCK_SHIFTS_STATE = MOCK_SHIFTS_STATE.filter(s => s.id !== id);
    return;
  }
  try {
    const docRef = doc(db, SHIFTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied deleting shift. This is likely due to Firestore security rules.");
      return;
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
      return MOCK_USERS;
    }
    throw error;
  }
};

export const updateUserRole = async (id: string, role: User['role']): Promise<void> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error("Authentication required");

  const response = await fetch('/api/admin/update-role', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ targetUid: id, newRole: role })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update role");
  }
};

export const addAnimal = async (animal: Omit<Animal, 'id'>): Promise<string> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  try {
    const docRef = await addDoc(collection(db, ANIMALS_COLLECTION), animal);
    return docRef.id;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied adding animal. This is likely due to Firestore security rules.");
      return "mock-id";
    }
    throw error;
  }
};

export const updateAnimal = async (id: string, animal: Partial<Animal>): Promise<void> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  try {
    const docRef = doc(db, ANIMALS_COLLECTION, id);
    await updateDoc(docRef, animal);
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied updating animal. This is likely due to Firestore security rules.");
      return;
    }
    throw error;
  }
};

export const submitApplication = async (application: Omit<AdoptionApplication, 'id'>): Promise<string> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  try {
    const docRef = await addDoc(collection(db, APPLICATIONS_COLLECTION), {
      ...application,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    });
    return docRef.id;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied submitting application. This is likely due to Firestore security rules.");
      return "mock-app-id";
    }
    throw error;
  }
};

export const updateApplicationStatus = async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  try {
    const docRef = doc(db, APPLICATIONS_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied updating application status. This is likely due to Firestore security rules.");
      return;
    }
    throw error;
  }
};

export const fetchFosterApplications = async (): Promise<FosterApplication[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const querySnapshot = await getDocs(collection(db, FOSTER_APPLICATIONS_COLLECTION));
    const applications: FosterApplication[] = [];
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() } as FosterApplication);
    });
    return applications;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied fetching foster applications. This is likely due to Firestore security rules.");
      return [];
    }
    throw error;
  }
};

export const fetchVolunteerApplications = async (): Promise<VolunteerApplication[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const querySnapshot = await getDocs(collection(db, VOLUNTEER_APPLICATIONS_COLLECTION));
    const applications: VolunteerApplication[] = [];
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() } as VolunteerApplication);
    });
    return applications;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied fetching volunteer applications. This is likely due to Firestore security rules.");
      return [];
    }
    throw error;
  }
};

export const updateFosterApplicationStatus = async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  try {
    const docRef = doc(db, FOSTER_APPLICATIONS_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied updating foster application status. This is likely due to Firestore security rules.");
      return;
    }
    throw error;
  }
};

export const updateVolunteerApplicationStatus = async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  try {
    const docRef = doc(db, VOLUNTEER_APPLICATIONS_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied updating volunteer application status. This is likely due to Firestore security rules.");
      return;
    }
    throw error;
  }
};

export const updateAnimalStatus = async (id: string, status: Animal['status']): Promise<void> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  try {
    const docRef = doc(db, ANIMALS_COLLECTION, id);
    await updateDoc(docRef, { status });
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied updating animal status. This is likely due to Firestore security rules.");
      return;
    }
    throw error;
  }
};

export const submitFosterApplication = async (application: Omit<FosterApplication, 'id'>): Promise<string> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  try {
    const docRef = await addDoc(collection(db, FOSTER_APPLICATIONS_COLLECTION), {
      ...application,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    });
    return docRef.id;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied submitting foster application. This is likely due to Firestore security rules.");
      return "mock-foster-id";
    }
    throw error;
  }
};

export const submitVolunteerApplication = async (application: Omit<VolunteerApplication, 'id'>): Promise<string> => {
  if (!isFirebaseConfigured) throw new Error("Firebase not configured");
  try {
    const docRef = await addDoc(collection(db, VOLUNTEER_APPLICATIONS_COLLECTION), {
      ...application,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    });
    return docRef.id;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied submitting volunteer application. This is likely due to Firestore security rules.");
      return "mock-volunteer-id";
    }
    throw error;
  }
};

export const fetchUserAdoptionApplications = async (userId: string): Promise<AdoptionApplication[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const q = query(collection(db, APPLICATIONS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const applications: AdoptionApplication[] = [];
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() } as AdoptionApplication);
    });
    return applications;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied fetching user adoption applications. This is likely due to Firestore security rules.");
      return [];
    }
    console.error("Error fetching user adoption applications:", error);
    return [];
  }
};

export const fetchUserFosterApplications = async (userId: string): Promise<FosterApplication[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const q = query(collection(db, FOSTER_APPLICATIONS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const applications: FosterApplication[] = [];
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() } as FosterApplication);
    });
    return applications;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied fetching user foster applications. This is likely due to Firestore security rules.");
      return [];
    }
    console.error("Error fetching user foster applications:", error);
    return [];
  }
};

export const claimShift = async (shiftId: string, userId: string): Promise<void> => {
  if (!isFirebaseConfigured) {
    const shift = MOCK_SHIFTS_STATE.find(s => s.id === shiftId);
    if (!shift) throw new Error("Shift not found");
    
    const currentClaimedBy = shift.claimedBy || [];
    if (currentClaimedBy.includes(userId)) {
      throw new Error("You have already claimed this shift");
    }
    
    if (shift.slots <= 0) {
      throw new Error("No slots available for this shift");
    }
    
    MOCK_SHIFTS_STATE = MOCK_SHIFTS_STATE.map(s => 
      s.id === shiftId 
        ? { ...s, claimedBy: [...currentClaimedBy, userId], slots: s.slots - 1 } 
        : s
    );
    return;
  }
  try {
    const shiftRef = doc(db, SHIFTS_COLLECTION, shiftId);
    const userRef = doc(db, USERS_COLLECTION, userId);
    
    await runTransaction(db, async (transaction) => {
      const [shiftSnap, userSnap] = await Promise.all([
        transaction.get(shiftRef),
        transaction.get(userRef)
      ]);

      if (!shiftSnap.exists()) throw new Error("Shift not found");
      if (!userSnap.exists()) throw new Error("User profile not found");
      
      const shiftData = shiftSnap.data() as VolunteerShift;
      const userData = userSnap.data() as User;

      const currentClaimedBy = shiftData.claimedBy || [];
      const userShifts = userData.shifts || [];
      
      if (currentClaimedBy.includes(userId)) {
        throw new Error("You have already claimed this shift");
      }
      
      if (shiftData.slots <= 0) {
        throw new Error("No slots available for this shift");
      }
      
      // Update shift document
      transaction.update(shiftRef, {
        claimedBy: [...currentClaimedBy, userId],
        slots: shiftData.slots - 1,
        updatedAt: new Date().toISOString()
      });

      // Update user document
      transaction.update(userRef, {
        shifts: [...userShifts, shiftId]
      });
    });
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied claiming shift. This is likely due to Firestore security rules.");
      return;
    }
    throw error;
  }
};

export const fetchUserShifts = async (userId: string): Promise<VolunteerShift[]> => {
  if (!isFirebaseConfigured) {
    return MOCK_SHIFTS_STATE.filter(s => s.claimedBy?.includes(userId));
  }
  try {
    const q = query(collection(db, SHIFTS_COLLECTION), where("claimedBy", "array-contains", userId));
    const querySnapshot = await getDocs(q);
    const shifts: VolunteerShift[] = [];
    querySnapshot.forEach((doc) => {
      shifts.push({ id: doc.id, ...doc.data() } as VolunteerShift);
    });
    return shifts;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied fetching user shifts. This is likely due to Firestore security rules.");
      return MOCK_SHIFTS_STATE.filter(s => s.claimedBy?.includes(userId));
    }
    console.error("Error fetching user shifts:", error);
    return [];
  }
};

export const fetchUserVolunteerApplications = async (userId: string): Promise<VolunteerApplication[]> => {
  if (!isFirebaseConfigured) return [];
  try {
    const q = query(collection(db, VOLUNTEER_APPLICATIONS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const applications: VolunteerApplication[] = [];
    querySnapshot.forEach((doc) => {
      applications.push({ id: doc.id, ...doc.data() } as VolunteerApplication);
    });
    return applications;
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.warn("Permission denied fetching user volunteer applications. This is likely due to Firestore security rules.");
      return [];
    }
    console.error("Error fetching user volunteer applications:", error);
    return [];
  }
};
