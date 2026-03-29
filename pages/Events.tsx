
import React, { useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { ShelterEvent } from '../types.ts';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, MapPin, Clock, Tag, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventsProps {
  user: FirebaseUser | null;
}

const mockEvents: ShelterEvent[] = [
  {
    id: '1',
    title: 'Community Dog Wash Day',
    date: '2026-04-12',
    time: '10:00 AM - 3:00 PM',
    location: 'Shelter Front Yard',
    description: 'Bring your pups for a refreshing bath! Our volunteers will provide the shampoo, towels, and lots of bubbles. All donations support our rescue efforts.',
    type: 'other',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    title: 'Adoption Extravaganza',
    date: '2026-05-20',
    time: '11:00 AM - 5:00 PM',
    location: 'Main Adoption Center',
    description: 'Our biggest adoption event of the season! Meet dozens of dogs and cats ready for their forever homes. Special adoption fees apply.',
    type: 'adoption',
    image: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '3',
    title: 'Puppy Socialization Workshop',
    date: '2026-04-25',
    time: '10:00 AM - 11:30 AM',
    location: 'Indoor Training Arena',
    description: 'A safe space for puppies under 6 months to play and learn vital social skills. Guided by our expert animal behaviorists.',
    type: 'workshop',
    image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    title: 'DIY Cat Toy Workshop',
    date: '2026-06-05',
    time: '1:00 PM - 2:30 PM',
    location: 'The Zen Den',
    description: 'Learn how to make engaging and safe toys for your feline friends using simple household materials. Fun for all ages!',
    type: 'workshop',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '5',
    title: 'Agility Fun Course',
    date: '2026-07-15',
    time: '9:00 AM - 12:00 PM',
    location: 'Outdoor Agility Field',
    description: 'Let your dog test their speed and coordination on our custom agility course. Trainers on site to provide tips and encouragement.',
    type: 'other',
    image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '6',
    title: 'Basic Grooming Demo',
    date: '2026-08-10',
    time: '2:00 PM - 4:00 PM',
    location: 'Grooming Station',
    description: 'Professional tips on brushing, nail trimming, and coat maintenance to keep your pet looking and feeling their best between salon visits.',
    type: 'workshop',
    image: 'https://images.unsplash.com/photo-1591768793355-74d7c836038c?auto=format&fit=crop&q=80&w=800'
  }
];

const Events: React.FC<EventsProps> = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // Starting April 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const days = [];
  const totalDays = daysInMonth(year, currentDate.getMonth());
  const startDay = firstDayOfMonth(year, currentDate.getMonth());

  // Add empty slots for days of previous month
  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  // Add days of current month
  for (let i = 1; i <= totalDays; i++) {
    days.push(new Date(year, currentDate.getMonth(), i));
  }

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return mockEvents.filter(event => event.date === dateString);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight italic">Shelter Events</h1>
        <p className="text-slate-600 max-w-2xl text-lg">Stay connected with our community through adoption events, educational workshops, and fundraisers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Calendar Column */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-2xl shadow-purple-50 overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-900 italic">{monthName} {year}</h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-600">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={nextMonth} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all text-slate-600">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((date, index) => {
                if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
                
                const events = getEventsForDate(date);
                const isSelected = selectedDate?.toDateString() === date.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group ${
                      isSelected 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' 
                        : 'bg-slate-50 hover:bg-purple-50 text-slate-700'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isToday && !isSelected ? 'text-purple-600 underline underline-offset-4' : ''}`}>
                      {date.getDate()}
                    </span>
                    {events.length > 0 && (
                      <div className="mt-1 flex flex-col items-center">
                        <span className={`text-[8px] font-black uppercase tracking-tighter ${isSelected ? 'text-white/80' : 'text-purple-400'}`}>
                          Events: {events.length}
                        </span>
                        <div className="flex gap-0.5 mt-0.5">
                          {events.map(e => (
                            <div 
                              key={e.id} 
                              className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-400'}`} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Events List Column */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-slate-900 italic">
                {selectedDate 
                  ? `Events for ${selectedDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}` 
                  : 'Upcoming Events'}
              </h3>
              {!selectedDate && (
                <span className="text-xs font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full">
                  All Year
                </span>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate?.toISOString() || 'upcoming'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {(selectedDate ? selectedDateEvents : mockEvents.slice(0, 4)).length > 0 ? (
                  (selectedDate ? selectedDateEvents : mockEvents.slice(0, 4)).map(event => (
                    <div key={event.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-purple-50 transition-all group">
                      <div className="flex gap-6">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-md">
                          <img src={event.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                              event.type === 'adoption' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              event.type === 'fundraiser' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                              event.type === 'workshop' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              'bg-purple-50 text-purple-600 border-purple-100'
                            }`}>
                              {event.type}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 mb-1 group-hover:text-purple-600 transition-colors">{event.title}</h4>
                          <p className="text-xs text-slate-500 mb-3 leading-relaxed">{event.description}</p>
                          <div className="flex flex-wrap items-center text-xs text-slate-400 gap-y-2 gap-x-4">
                            <span className="flex items-center gap-1 font-black text-slate-900 uppercase tracking-tight">
                              <CalendarIcon className="w-3.5 h-3.5 text-purple-600" /> 
                              {new Date(event.date + 'T00:00:00').toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-3.5 h-3.5 text-purple-500" /> 
                              {event.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                    <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">No events scheduled for this day.</p>
                    <button onClick={() => setSelectedDate(null)} className="text-xs text-purple-600 font-black uppercase tracking-widest mt-4 hover:underline">View All Upcoming</button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
