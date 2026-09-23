import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, AlertTriangle, User, Phone, MapPin } from 'lucide-react';

const VEHICLES = [
  { id: 'amb_101', name: 'KA-01-EQ-1234 (Ramesh Kumar)' },
  { id: 'amb_102', name: 'KA-01-EQ-5678 (Suresh Roy)' },
];

export default function DriverTerminal() {
  const [selectedAmbulanceId, setSelectedAmbulanceId] = useState(VEHICLES[0].id);
  const [isDispatched, setIsDispatched] = useState(false);
  const [activePickup, setActivePickup] = useState(null);
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/hospital/hosp_01/ambulances');
      const data = await res.json();
      const isAvail = data.data.some((a) => a.ambulance_id === selectedAmbulanceId);

      setIsDispatched(!isAvail);

      if (!isAvail) {
        // If dispatched, display active assignment
        setActivePickup({
          patientName: 'Rahul (Test Citizen)',
          phone: '9876543210',
          location: 'Lat 12.9716, Long 77.5946 (Indiranagar, Bangalore)',
        });
      } else {
        setActivePickup(null);
      }
    } catch (err) {
      console.error('Error checking driver status:', err);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [selectedAmbulanceId]);

  const handleCompletePickup = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sos/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ambulance_id: selectedAmbulanceId }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Pickup successfully completed! Status updated to AVAILABLE.');
        checkStatus();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert('Network error completing trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: 480, margin: '1.5rem auto', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.5rem' }}>
        <div style={{ padding: '0.6rem', borderRadius: 10, background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>
          <Truck size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Driver Dispatch Terminal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Vehicle Telematics & Job Status</p>
        </div>
      </div>

      <div className="input-group" style={{ marginTop: '1.2rem' }}>
        <label>Select Your Vehicle</label>
        <select
          className="input-field"
          value={selectedAmbulanceId}
          onChange={(e) => setSelectedAmbulanceId(e.target.value)}
        >
          {VEHICLES.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>

      {/* Driver Status Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.9rem',
          borderRadius: 12,
          marginTop: '1rem',
          background: isDispatched ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
          border: isDispatched ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
          color: isDispatched ? '#f87171' : '#34d399',
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: isDispatched ? '#ef4444' : '#10b981',
            boxShadow: isDispatched ? '0 0 10px #ef4444' : '0 0 10px #10b981',
          }}
        ></span>
        <strong style={{ fontSize: '0.9rem' }}>
          {isDispatched ? 'Status: DISPATCHED (Emergency Active)' : 'Status: AVAILABLE (On Standby)'}
        </strong>
      </div>

      {/* Active Assignment Card */}
      {isDispatched && (
        <div
          style={{
            marginTop: '1.5rem',
            background: 'rgba(239, 68, 68, 0.07)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 14,
            padding: '1.2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', marginBottom: '0.8rem' }}>
            <AlertTriangle size={18} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Active Dispatch Assignment</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem', color: 'var(--text-main)' }}>
            <div><User size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--text-muted)' }} /> <strong>Patient:</strong> {activePickup?.patientName}</div>
            <div><Phone size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--text-muted)' }} /> <strong>Phone:</strong> {activePickup?.phone}</div>
            <div><MapPin size={13} style={{ display: 'inline', marginRight: 5, color: 'var(--text-muted)' }} /> <strong>Destination:</strong> {activePickup?.location}</div>
          </div>

          <button
            className="action-btn success"
            style={{ width: '100%', marginTop: '1.2rem', padding: '0.85rem', justifyContent: 'center' }}
            onClick={handleCompletePickup}
            disabled={loading}
          >
            <CheckCircle size={18} /> Mark as Reached & Available
          </button>
        </div>
      )}
    </div>
  );
}
