
export enum AnimalType {
  DOG = 'Dog',
  CAT = 'Cat'
}

export interface Animal {
  id: string;
  name: string;
  type: AnimalType;
  breed: string;
  age: string;
  gender: 'Male' | 'Female';
  description: string;
  image: string;
  tags: string[];
  status?: 'available' | 'fostered' | 'adopted';
}

export interface AdoptionApplication {
  id: string;
  userId: string;
  animalId: string;
  applicantName: string;
  applicantEmail: string;
  homeType: string;
  hasOtherPets: boolean;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface FosterApplication {
  id: string;
  userId: string;
  animalId: string;
  applicantName: string;
  applicantEmail: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  hasOtherPets: boolean;
  canIsolate: boolean;
  canTransport: boolean;
  preferences: string[];
  fosterDuration: string;
  experience: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface VolunteerApplication {
  id: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface VolunteerShift {
  id: string;
  title: string;
  date: string;
  time: string;
  slots: number;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  preferredCommunication?: 'email' | 'phone';
  role: 'admin' | 'staff' | 'volunteer' | 'basicUser';
  createdAt?: string;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
