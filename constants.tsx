
import { Animal, AnimalType, VolunteerShift, User, AdoptionApplication } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Sarah Miller', email: 'sarah.m@example.com', role: 'admin' },
  { id: 'u2', name: 'James Wilson', email: 'j.wilson@example.com', role: 'staff' },
  { id: 'u3', name: 'Emma Thompson', email: 'emma.t@example.com', role: 'staff' },
  { id: 'u4', name: 'Michael Chen', email: 'mchen88@example.com', role: 'volunteer' },
  { id: 'u5', name: 'David Rodriguez', email: 'david.r@example.com', role: 'basicUser' },
  { id: 'u6', name: 'Jessica Lee', email: 'jlee_paws@example.com', role: 'staff' },
  { id: 'admin-setup', name: 'Admin Setup', email: 'brennanxd0@gmail.com', role: 'admin' },
];

export const MOCK_ANIMALS: Animal[] = [
  {
    id: '1',
    name: 'Luna',
    type: AnimalType.DOG,
    breed: 'Golden Retriever Mix',
    age: '2 years',
    gender: 'Female',
    description: 'Luna is a friendly 2-year-old Golden Retriever Mix who is always ready for an adventure! She has a playful attitude and absolutely loves splashing in water or cuddling after a long hike. Luna is healthy, spayed, fully vaccinated, microchipped, and ready to bring joy to her forever home.',
    image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
    tags: ['Active', 'Kid-friendly', 'Healthy']
  },
  {
    id: '2',
    name: 'Oliver',
    type: AnimalType.CAT,
    breed: 'Domestic Shorthair',
    age: '5 years',
    gender: 'Male',
    description: 'Oliver is a calm and affectionate 5-year-old Domestic Shorthair. He is a healthy, happy cat who enjoys quiet afternoons by the window and loves nothing more than gentle chin scratches and cozy naps. Oliver is neutered, vaccinated, microchipped, and looking for a peaceful home.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    tags: ['Quiet', 'Calm', 'Healthy']
  },
  {
    id: '3',
    name: 'Bella',
    type: AnimalType.DOG,
    breed: 'Beagle',
    age: '8 months',
    gender: 'Female',
    description: 'Bella is a curious 8-month-old Beagle puppy with a big heart and a very playful spirit! She is a vibrant, living ball of energy who loves exploring new scents and playing with her favorite squeaky toys. Bella is healthy, spayed, vaccinated, microchipped, and eager to find a family.',
    image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800',
    tags: ['Puppy', 'Vibrant', 'Healthy']
  },
  {
    id: '4',
    name: 'Milo',
    type: AnimalType.CAT,
    breed: 'Siamese Mix',
    age: '1 year',
    gender: 'Male',
    description: 'Milo is a social and vocal 1-year-old Siamese Mix who loves being the center of attention! He is incredibly healthy and friendly, and will follow you around just to get some extra play time or cuddles. Milo is neutered, vaccinated, microchipped, and ready to be your most loyal companion.',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=800',
    tags: ['Vocal', 'Social', 'Healthy']
  }
];

export const MOCK_APPLICATIONS: AdoptionApplication[] = [
  { 
    id: 'app1', 
    userId: 'mock-user-1',
    animalId: '1', 
    applicantName: 'Alice Smith', 
    applicantEmail: 'alice.s@example.com',
    homeType: 'House with Yard',
    hasOtherPets: true,
    reason: 'I have a large backyard and would love a companion for my current Golden Retriever.',
    status: 'pending',
    submittedAt: '2026-05-18'
  },
  { 
    id: 'app2', 
    userId: 'mock-user-2',
    animalId: '2', 
    applicantName: 'Bob Brown', 
    applicantEmail: 'bob.b@example.com',
    homeType: 'Apartment',
    hasOtherPets: false,
    reason: 'I work from home and want a quiet companion. Oliver seems perfect for my lifestyle.',
    status: 'pending',
    submittedAt: '2026-05-19'
  },
  { 
    id: 'app3', 
    userId: 'mock-user-3',
    animalId: '1', 
    applicantName: 'Charlie Davis', 
    applicantEmail: 'charlie.d@example.com',
    homeType: 'Townhouse',
    hasOtherPets: false,
    reason: 'Active lifestyle, looking for a running buddy.',
    status: 'pending',
    submittedAt: '2026-05-19'
  },
  { 
    id: 'app4', 
    userId: 'mock-user-4',
    animalId: '4', 
    applicantName: 'Diana Prince', 
    applicantEmail: 'diana.p@example.com',
    homeType: 'Apartment',
    hasOtherPets: true,
    reason: 'My Siamese cat needs a brother!',
    status: 'pending',
    submittedAt: '2026-05-20'
  },
  { 
    id: 'app5', 
    userId: 'mock-user-5',
    animalId: '3', 
    applicantName: 'Edward Norton', 
    applicantEmail: 'ed.n@example.com',
    homeType: 'House with Yard',
    hasOtherPets: false,
    reason: 'Looking for a family pet that can grow with my kids.',
    status: 'pending',
    submittedAt: '2026-05-20'
  },
];

export const MOCK_SHIFTS: VolunteerShift[] = [
  {
    id: 's1',
    title: 'Morning Feeding & Cleaning',
    date: '2026-05-20',
    time: '08:00 AM - 11:00 AM',
    slots: 2,
    description: 'Help our small staff prepare breakfast and clean the kennels.',
    type: 'volunteer'
  },
  {
    id: 's2',
    title: 'Afternoon Dog Walking',
    date: '2026-05-20',
    time: '02:00 PM - 04:00 PM',
    slots: 1,
    description: 'Take one of our senior dogs for a gentle stroll down the country road.',
    type: 'volunteer'
  },
  {
    id: 's3',
    title: 'Cat Socialization',
    date: '2026-05-21',
    time: '10:00 AM - 12:00 PM',
    slots: 2,
    description: 'Sit in the cat room and help our shy feline residents get used to visitors.',
    type: 'volunteer'
  }
];
