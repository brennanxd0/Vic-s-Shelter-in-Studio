
import React, { useState } from 'react';

const Donate: React.FC = () => {
  const [amount, setAmount] = useState<number | string>(50);
  const [isRecurring, setIsRecurring] = useState(true);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center gap-16">
      <div className="flex-1">
        <span className="text-purple-700 font-black uppercase tracking-widest text-xs bg-purple-50 px-3 py-1 rounded-full mb-6 inline-block">Support Our Mission</span>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-8">Your Kindness <br/><span className="text-purple-600">Fuels Second Chances</span></h1>
        <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-xl">
          Vic's Animal Shelter is a non-profit organization. 100% of your donation goes directly towards medical care, premium nutrition, and emergency rescues.
        </p>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <div className="bg-purple-100 p-2 rounded-full"><svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg></div>
             <p className="text-slate-700 font-bold">Tax-deductible charitable giving</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-purple-100 p-2 rounded-full"><svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg></div>
             <p className="text-slate-700 font-bold">92 cents of every dollar goes to animal care</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-purple-100 p-2 rounded-full"><svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg></div>
             <p className="text-slate-700 font-bold">Secure payment processing</p>
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-xl">
        <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-2xl shadow-purple-100 border border-slate-100">
          <div className="flex bg-slate-50 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => setIsRecurring(true)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${isRecurring ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >Monthly</button>
            <button 
              onClick={() => setIsRecurring(false)}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${!isRecurring ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >One-Time</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[25, 50, 100, 250, 500].map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`py-4 rounded-2xl border-2 font-black text-lg transition-all ${amount === amt ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-slate-50 text-slate-500 hover:border-slate-200'}`}
              >
                ${amt}
              </button>
            ))}
            <div className="relative">
              <input 
                type="number" 
                placeholder="Other" 
                className="w-full h-full py-4 px-4 rounded-2xl border-2 border-slate-50 text-slate-900 font-bold focus:outline-none focus:border-purple-600" 
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-purple-50 p-6 rounded-2xl mb-10 border border-purple-100 shadow-inner">
            <h4 className="text-purple-900 font-black text-xs uppercase tracking-widest mb-2">Impact at Vic's:</h4>
            <p className="text-purple-800 text-sm font-medium">
              ${amount || 0} provides {Number(amount) >= 100 ? 'complete medical care and vaccinations' : 'nutritious meals for a week'} for one rescue animal.
            </p>
          </div>

          <button className="w-full py-5 bg-purple-600 text-white rounded-3xl font-black text-xl shadow-xl shadow-purple-100 hover:bg-purple-700 hover:scale-[1.02] active:scale-95 transition-all mb-8">
            Donate Now
          </button>
          
          <div className="flex items-center justify-center gap-8 opacity-20 grayscale hover:opacity-40 transition-opacity">
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="Paypal" className="h-6" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" referrerPolicy="no-referrer" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;
