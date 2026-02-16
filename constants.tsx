
import { Animal, AnimalType, VolunteerShift, User, AdoptionApplication } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Sarah Miller', email: 'sarah.m@example.com', role: 'admin' },
  { id: 'u2', name: 'James Wilson', email: 'j.wilson@example.com', role: 'volunteer' },
  { id: 'u3', name: 'Emma Thompson', email: 'emma.t@example.com', role: 'volunteer' },
  { id: 'u4', name: 'Michael Chen', email: 'mchen88@example.com', role: 'user' },
  { id: 'u5', name: 'David Rodriguez', email: 'david.r@example.com', role: 'user' },
  { id: 'u6', name: 'Jessica Lee', email: 'jlee_paws@example.com', role: 'volunteer' },
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
    image: 'https://loremflickr.com/800/600/dog,goldenretriever?lock=101',
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
    image: 'https://loremflickr.com/800/600/cat,shorthair?lock=202',
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
    image: 'https://loremflickr.com/800/600/dog,beagle?lock=303',
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
    image: 'https://loremflickr.com/800/600/cat,siamese?lock=404',
    tags: ['Vocal', 'Social', 'Playful']
  }
];

export const MOCK_APPLICATIONS: AdoptionApplication[] = [
  { 
    id: 'app1', 
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
