
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Adopt from './pages/Adopt';
import Volunteer from './pages/Volunteer';
import Donate from './pages/Donate';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import { MOCK_ANIMALS } from './constants';
import { Animal, AdoptionApplication } from './types';
import { fetchApplications } from './services/mockApi';

const App: React.FC = () => {
  const [animals, setAnimals] = useState<Animal[]>(MOCK_ANIMALS);
  const [applications, setApplications] = useState<AdoptionApplication[]>([]);

  useEffect(() => {
    const loadApps = async () => {
      const data = await fetchApplications();
      setApplications(data);
    };
    loadApps();
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adopt" element={<Adopt animals={animals} />} />
          <Route path="/volunteer" element={<Volunteer />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminDashboard 
            animals={animals} 
            setAnimals={setAnimals} 
            applications={applications}
            setApplications={setApplications}
          />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
