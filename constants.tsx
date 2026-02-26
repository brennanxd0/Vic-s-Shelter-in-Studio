
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
    description: 'Luna is a high-energy sweetheart who loves water and long hikes. She is great with children and other dogs.',
    image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800',
    tags: ['Active', 'Kid-friendly', 'Water-lover']
  },
  {
    id: '2',
    name: 'Oliver',
    type: AnimalType.CAT,
    breed: 'Domestic Shorthair',
    age: '5 years',
    gender: 'Male',
    description: 'Oliver is a distinguished gentleman who prefers quiet afternoons by the window. He loves chin scratches.',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
    tags: ['Quiet', 'Calm', 'Affectionate']
  },
  {
    id: '3',
    name: 'Bella',
    type: AnimalType.DOG,
    breed: 'Beagle',
    age: '8 months',
    gender: 'Female',
    description: 'Bella is a curious puppy with a loud bark and an even bigger heart. She needs an owner with patience for training.',
    image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800',
    tags: ['Puppy', 'Needs Training', 'Curious']
  },
  {
    id: '4',
    name: 'Milo',
    type: AnimalType.CAT,
    breed: 'Siamese Mix',
    age: '1 year',
    gender: 'Male',
    description: 'Milo is a vocal and social cat who loves to follow his humans around the house. He enjoys interactive play.',
    image: 'https://images.unsplash.com/photo-1513245535761-06642199ed15?auto=format&fit=crop&q=80&w=800',
    tags: ['Vocal', 'Social', 'Playful']
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
    description: 'Help our small staff prepare breakfast and clean the kennels.'
  },
  {
    id: 's2',
    title: 'Afternoon Dog Walking',
    date: '2026-05-20',
    time: '02:00 PM - 04:00 PM',
    slots: 1,
    description: 'Take one of our senior dogs for a gentle stroll down the country road.'
  },
  {
    id: 's3',
    title: 'Cat Socialization',
    date: '2026-05-21',
    time: '10:00 AM - 12:00 PM',
    slots: 2,
    description: 'Sit in the cat room and help our shy feline residents get used to visitors.'
  }
];
