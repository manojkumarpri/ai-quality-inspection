import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Users, ShieldCheck } from 'lucide-react';
import { User } from './types/api';
import { getUsers } from './services/auth.api';
import { setCurrentUserId, getCurrentUserId } from './services/client';
import Navbar from './components/Navbar';
import InspectPage from './pages/InspectPage';
import HistoryPage from './pages/HistoryPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>(getCurrentUserId());

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error);
  }, []);

  function handleUserChange(userId: string) {
    setSelectedUser(userId);
    setCurrentUserId(userId);
  }

  const currentUserObj = useMemo(() => {
  return users.find(u => u.id === selectedUser);
}, [users, selectedUser]);

const isQualityEngineer = currentUserObj?.role === 'QUALITY_ENGINEER';

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Top Header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">AI-Assisted Quality Inspection</h1>
              <p className="text-xs text-slate-400">Automated Visual Defect Detection & Compliance Audit</p>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">Active Person:</span>
              <select 
                value={selectedUser} 
                onChange={(e) => handleUserChange(e.target.value)}
                className="bg-slate-900 text-slate-200 text-sm font-medium rounded px-2 py-1 outline-none border border-slate-700 cursor-pointer"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'QUALITY_ENGINEER' ? 'Quality Engineer' : 'Supervisor'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Navbar */}
        <Navbar />

        {/* Route Pages */}
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<InspectPage isQualityEngineer={isQualityEngineer} />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}