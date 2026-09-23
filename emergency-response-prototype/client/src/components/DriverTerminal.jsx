import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle, AlertTriangle, User, Phone, MapPin } from 'lucide-react';
import KineticGrid from './KineticGrid';

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
      const isAvail = data.data?.some((a) => a.ambulance_id === selectedAmbulanceId);

      setIsDispatched(!isAvail);

      if (!isAvail) {
        // Fetch actual assigned SOS alert from backend
        const activeRes = await fetch(`/api/sos/driver/active/${selectedAmbulanceId}`);
        const activeData = await activeRes.json();
        
        if (activeData.success && activeData.data) {
          const req = activeData.data;
          setActivePickup({
            patientName: req.user_name || 'Emergency Citizen',
            phone: req.user_phone || 'N/A',
            location: `Lat ${req.latitude?.toFixed(4)}, Long ${req.longitude?.toFixed(4)}`,
          });
        } else {
          setActivePickup({
            patientName: 'Emergency Citizen',
            phone: 'N/A',
            location: 'Location coordinates on route',
          });
        }
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
    <KineticGrid
      backgroundColor="#090d16"
      dotColor="rgba(56, 189, 248, 0.25)"
      glowColor="#38bdf8"
      gridGap={30}
    >
      <div
        style={{
          maxWidth: 480,
          margin: '2rem auto',
          padding: '2rem',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          color: '#f8fafc',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.2rem' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 14,
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              border: '1px solid rgba(96, 165, 250, 0.3)',
            }}
          >
            <Truck size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              Driver Dispatch Terminal
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Vehicle Telematics & Job Status
            </p>
          </div>
        </div>

        {/* Vehicle Selector */}
        <div style={{ marginTop: '1.2rem' }}>
          <label
            style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#cbd5e1',
              marginBottom: '0.4rem',
            }}
          >
            Select Your Vehicle
          </label>
          <select
            value={selectedAmbulanceId}
            onChange={(e) => setSelectedAmbulanceId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '10px',
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          >
            {VEHICLES.map((v) => (
              <option key={v.id} value={v.id} style={{ background: '#0f172a', color: '#ffffff' }}>
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
            borderRadius: '12px',
            marginTop: '1.2rem',
            background: isDispatched ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: isDispatched ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
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
          />
          <strong style={{ fontSize: '0.9rem' }}>
            {isDispatched ? 'Status: DISPATCHED (Emergency Active)' : 'Status: AVAILABLE (On Standby)'}
          </strong>
        </div>

        {/* Active Assignment Card */}
        {isDispatched && (
          <div
            style={{
              marginTop: '1.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '16px',
              padding: '1.2rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171', marginBottom: '0.8rem' }}>
              <AlertTriangle size={20} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Active Dispatch Assignment</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: '#f1f5f9' }}>
              <div>
                <User size={14} style={{ display: 'inline', marginRight: 6, color: '#94a3b8' }} />
                <strong>Patient:</strong> {activePickup?.patientName}
              </div>
              <div>
                <Phone size={14} style={{ display: 'inline', marginRight: 6, color: '#94a3b8' }} />
                <strong>Phone:</strong> {activePickup?.phone}
              </div>
              <div>
                <MapPin size={14} style={{ display: 'inline', marginRight: 6, color: '#94a3b8' }} />
                <strong>Destination:</strong> {activePickup?.location}
              </div>
            </div>

            <button
              style={{
                width: '100%',
                marginTop: '1.2rem',
                padding: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)',
                opacity: loading ? 0.7 : 1,
              }}
              onClick={handleCompletePickup}
              disabled={loading}
            >
              <CheckCircle size={18} /> Mark as Reached & Available
            </button>
          </div>
        )}
      </div>
    </KineticGrid>
  );
}