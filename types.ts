
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
}

export interface AdoptionApplication {
  id: string;
  animalId: string;
  applicantName: string;
  applicantEmail: string;
  homeType: string;
  hasOtherPets: boolean;
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
  role: 'user' | 'staff' | 'admin';
}
