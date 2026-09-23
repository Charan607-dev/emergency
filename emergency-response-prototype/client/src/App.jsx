import React, { useState } from 'react';
import { Siren, Building2, Truck, Activity } from 'lucide-react';
import UserSOS from './components/UserSOS';
import HospitalDashboard from './components/HospitalDashboard';
import DriverTerminal from './components/DriverTerminal';

export default function App() {
  const [activeTab, setActiveTab] = useState('user'); // 'user', 'hospital', 'driver'

  return (
    <div>
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">
            <Activity size={22} />
          </div>
          <div>
            <h1>ResQ Emergency</h1>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: 0.5 }}>
              INTEGRATED DISPATCH SYSTEM
            </span>
          </div>
        </div>

        <div className="nav-tabs">
          <button
            className={`nav-btn ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => setActiveTab('user')}
          >
            <Siren size={16} />
            <span>Citizen SOS</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'hospital' ? 'active' : ''}`}
            onClick={() => setActiveTab('hospital')}
          >
            <Building2 size={16} />
            <span>Hospital Control</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'driver' ? 'active' : ''}`}
            onClick={() => setActiveTab('driver')}
          >
            <Truck size={16} />
            <span>Driver Terminal</span>
          </button>
        </div>
      </nav>

      <main className="content-area">
        {activeTab === 'user' && <UserSOS />}
        {activeTab === 'hospital' && <HospitalDashboard />}
        {activeTab === 'driver' && <DriverTerminal />}
      </main>
    </div>
  );
}
