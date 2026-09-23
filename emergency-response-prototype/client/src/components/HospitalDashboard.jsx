import React, { useState, useEffect } from 'react';
import { Building2, RefreshCw, Truck, AlertCircle, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import KineticGrid from './KineticGrid';

const HOSPITAL_ID = 'hosp_01';

export default function HospitalDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAmbulance, setSelectedAmbulance] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertsRes, ambRes] = await Promise.all([
        fetch(`/api/hospital/${HOSPITAL_ID}/alerts`),
        fetch(`/api/hospital/${HOSPITAL_ID}/ambulances`)
      ]);
      const alertsData = await alertsRes.json();
      const ambData = await ambRes.json();

      setAlerts(alertsData.data || []);
      setAmbulances(ambData.data || []);
    } catch (err) {
      console.error('Failed to fetch hospital data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (requestId) => {
    const ambulanceId = selectedAmbulance[requestId] || (ambulances[0] && ambulances[0].ambulance_id);
    if (!ambulanceId) {
      alert('Please select an ambulance first.');
      return;
    }

    try {
      const res = await fetch('/api/sos/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          ambulance_id: ambulanceId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Error assigning ambulance');
    }
  };

  return (
    <KineticGrid
      backgroundColor="#090d16"
      dotColor="rgba(59, 130, 246, 0.22)"
      glowColor="#3b82f6"
      gridGap={32}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Building2 color="#3b82f6" /> City Care Hospital Dispatch Control
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time Emergency Response & Fleet Dispatch System</p>
          </div>
          <button className="action-btn primary" onClick={fetchData} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinner' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="dashboard-grid">
          {/* Incoming Emergency Alerts */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="panel-header">
              <h2>
                <AlertCircle color="#ef4444" size={20} />
                Incoming SOS Alerts
              </h2>
              <span className="badge-count">{alerts.length} Pending</span>
            </div>

            {alerts.length === 0 ? (
              <div className="empty-state">
                <CheckCircle2 size={42} color="#10b981" style={{ marginBottom: '0.8rem', opacity: 0.7 }} />
                <p>No active emergencies right now.</p>
                <span style={{ fontSize: '0.8rem' }}>Emergency alerts triggered by citizens will appear here in real-time.</span>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.request_id} className="alert-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', color: '#f87171', fontWeight: 700 }}>
                        🚨 {alert.user_name}
                      </h3>
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={13} /> {alert.user_phone}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} /> {alert.latitude?.toFixed(4)}, {alert.longitude?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {new Date(alert.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.5rem' }}>
                    <select
                      className="input-field"
                      style={{ flex: 1, padding: '0.55rem' }}
                      value={selectedAmbulance[alert.request_id] || ''}
                      onChange={(e) =>
                        setSelectedAmbulance({ ...selectedAmbulance, [alert.request_id]: e.target.value })
                      }
                    >
                      {ambulances.length === 0 ? (
                        <option value="">No Ambulances Available</option>
                      ) : (
                        ambulances.map((amb) => (
                          <option key={amb.ambulance_id} value={amb.ambulance_id}>
                            {amb.vehicle_number} — {amb.driver_name}
                          </option>
                        ))
                      )}
                    </select>

                    <button
                      className="action-btn success"
                      onClick={() => handleAssign(alert.request_id)}
                      disabled={ambulances.length === 0}
                    >
                      <Truck size={16} /> Dispatch
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Hospital Ambulances Fleet */}
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="panel-header">
              <h2>
                <Truck color="#10b981" size={20} />
                Hospital Fleet
              </h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {ambulances.length} Active Units
              </span>
            </div>

            {ambulances.length === 0 ? (
              <div className="empty-state">
                <p>No ambulances currently available.</p>
                <span style={{ fontSize: '0.8rem' }}>All units are either dispatched or completing pickups.</span>
              </div>
            ) : (
              ambulances.map((amb) => (
                <div key={amb.ambulance_id} className="ambulance-card">
                  <div>
                    <strong style={{ fontSize: '0.95rem', display: 'block', color: 'var(--text-main)' }}>
                      {amb.vehicle_number}
                    </strong>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <span>👨‍✈️ {amb.driver_name}</span> &bull; <span>📞 {amb.driver_phone}</span>
                    </div>
                  </div>
                  <span className="status-chip available">AVAILABLE</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </KineticGrid>
  );
}
