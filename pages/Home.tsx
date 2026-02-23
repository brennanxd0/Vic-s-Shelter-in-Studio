
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-purple-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-40 flex flex-col md:flex-row items-center">
          <div className="flex-1 text-center md:text-left z-10">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-purple-700 uppercase bg-purple-100 rounded-full">Save a Life Today</span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 leading-tight mb-6">
              Find Your New <br/><span className="text-purple-600">Best Friend</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-xl">
              Vic's is a small-town shelter with a big heart. Nestled in the countryside, we provide a peaceful home for animals waiting to meet their special someone.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
              <Link to="/adopt" className="px-8 py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 hover:-translate-y-1 transition-all">Meet Our Pets</Link>
              <Link to="/volunteer" className="px-8 py-4 bg-white text-slate-800 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all">Join Our Volunteers</Link>
            </div>
          </div>
          <div className="flex-1 mt-12 md:mt-0 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl rotate-3 scale-95 md:scale-100 border-4 border-white">
              <img src="https://loremflickr.com/800/800/dog?lock=77" alt="Happy dog" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-[3rem] p-8 md:p-16 text-center shadow-2xl shadow-purple-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">185+</div>
              <div className="text-slate-400 font-medium">Animals Rescued</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-purple-400 mb-2">142+</div>
              <div className="text-slate-400 font-medium">Happy Adoptions</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">32+</div>
              <div className="text-slate-400 font-medium">Local Volunteers</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-purple-400 mb-2">2.5k</div>
              <div className="text-slate-400 font-medium">Lbs Food Shared</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Who are you looking for?</h2>
          <p className="text-slate-500">Explore our feline and canine residents ready for a forever home.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Puppies', query: 'puppy,dog', lock: '10' },
            { name: 'Kittens', query: 'kitten,cat', lock: '20' },
            { name: 'Adult Dogs', query: 'puppy,dog', lock: '38' },
            { name: 'Adult Cats', query: 'cat,black', lock: '40' }
          ].map((cat) => (
            <Link key={cat.name} to="/adopt" className="group relative h-64 rounded-3xl overflow-hidden shadow-md">
              <img 
                src={`https://loremflickr.com/400/600/${cat.query}?lock=${cat.lock}`} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt={cat.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold">{cat.name}</h3>
                <p className="text-sm text-slate-200">View All Available</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured CTA */}
      <section className="bg-slate-50 py-20 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">Can't adopt? You can still <span className="text-purple-600 underline decoration-wavy underline-offset-8">save lives</span>.</h2>
            <p className="text-slate-600 mb-8 text-lg">Your donations provide medical care, warm beds, and nutritious food to cats and dogs waiting for their forever homes. Even a small gift makes a big difference in a rural shelter like ours.</p>
            <div className="flex space-x-4">
              <Link to="/donate" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg">Donate Now</Link>
              <Link to="/volunteer" className="px-8 py-3 border border-slate-300 text-slate-800 rounded-xl font-bold hover:bg-white transition-colors">Learn to Volunteer</Link>
            </div>
          </div>
          <div className="md:w-1/2 flex gap-4">
            <div className="flex-1 space-y-4">
               <img src="https://loremflickr.com/400/500/cat,rescue?lock=123" className="w-full h-64 object-cover rounded-2xl shadow-lg shadow-purple-50" alt="Cat care" />
               <img src="https://loremflickr.com/400/300/cat?lock=88" className="w-full h-40 object-cover rounded-2xl shadow-lg shadow-purple-50" alt="Pet care" />
            </div>
            <div className="flex-1 space-y-4 pt-8">
               <img src="https://loremflickr.com/400/300/dog?lock=77" className="w-full h-40 object-cover rounded-2xl shadow-lg shadow-purple-50" alt="Pet care" />
               <img src="https://loremflickr.com/400/500/cat,happy?lock=66" className="w-full h-64 object-cover rounded-2xl shadow-lg shadow-purple-50" alt="Pet care" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
