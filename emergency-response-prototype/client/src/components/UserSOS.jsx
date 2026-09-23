import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, CheckCircle, Navigation, Phone, User } from 'lucide-react';
import KineticGrid from './KineticGrid';

export default function UserSOS() {
  const [userName, setUserName] = useState('Arun Kumar');
  const [userPhone, setUserPhone] = useState('9876543210');
  const [status, setStatus] = useState('IDLE'); // IDLE, SENDING, PENDING, ASSIGNED
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [assignedAmbulance, setAssignedAmbulance] = useState(null);
  const [coords, setCoords] = useState(null);

  const handleTriggerSOS = () => {
    setStatus('SENDING');
    setStatusText('Acquiring high-accuracy GPS coordinates...');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userCoords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setCoords(userCoords);
          sendSOS(userCoords.latitude, userCoords.longitude);
        },
        () => {
          const fallback = { latitude: 12.9716, longitude: 77.5946 };
          setCoords(fallback);
          sendSOS(fallback.latitude, fallback.longitude);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      const fallback = { latitude: 12.9716, longitude: 77.5946 };
      setCoords(fallback);
      sendSOS(fallback.latitude, fallback.longitude);
    }
  };

  const sendSOS = async (lat, long) => {
    setStatusText('Broadcasting SOS alert to City Care Hospital...');
    try {
      const res = await fetch('/api/sos/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: userName,
          user_phone: userPhone,
          latitude: lat,
          longitude: long,
          hospital_id: 'hosp_01',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActiveRequestId(data.data.request_id);
        setStatus('PENDING');
        setStatusText('SOS Dispatched! Hospital is prioritizing your emergency...');
      } else {
        setStatus('IDLE');
        alert('Failed to send SOS: ' + data.message);
      }
    } catch (err) {
      setStatus('IDLE');
      alert('Network error connecting to emergency backend.');
    }
  };

  // Poll for ambulance assignment
  useEffect(() => {
    if (status !== 'PENDING' || !activeRequestId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sos/status/${activeRequestId}`);
        const data = await res.json();
        
        if (data.success && data.data) {
          const reqData = data.data;

          if (reqData.status === 'ASSIGNED' && reqData.ambulance) {
            setStatus('ASSIGNED');
            setStatusText('🚨 Ambulance Dispatched & In Transit!');
            setAssignedAmbulance({
              vehicleNumber: reqData.ambulance.vehicle_number,
              driverName: reqData.ambulance.driver_name,
              driverPhone: reqData.ambulance.driver_phone,
            });
            clearInterval(interval);
          } else if (reqData.status === 'COMPLETED') {
            setStatus('COMPLETED');
            setStatusText('✅ Emergency Response Completed');
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status, activeRequestId]);

  return (
    <KineticGrid
      backgroundColor="#090d16"
      dotColor="rgba(239, 68, 68, 0.2)"
      glowColor="#ef4444"
      gridGap={32}
    >
      <div className="glass-panel sos-container">
        <div style={{ display: 'inline-flex', padding: '0.6rem', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', color: '#ef4444', marginBottom: '1rem' }}>
          <AlertTriangle size={32} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          Emergency Assistance
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.8rem' }}>
          Instantly alert the emergency dispatch team at City Care Hospital with your live GPS location.
        </p>

        {status === 'IDLE' && (
          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
            <div className="input-group">
              <label><User size={14} style={{ display: 'inline', marginRight: 4 }} /> Patient / Caller Name</label>
              <input
                className="input-field"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Full Name"
              />
            </div>
            <div className="input-group">
              <label><Phone size={14} style={{ display: 'inline', marginRight: 4 }} /> Phone Number</label>
              <input
                className="input-field"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="Mobile Number"
              />
            </div>
          </div>
        )}

        {/* SOS Button with Glowing Rings */}
        <div className="sos-pulse-wrapper">
          {status !== 'IDLE' && (
            <>
              <div className="sos-pulse-ring"></div>
              <div className="sos-pulse-ring"></div>
              <div className="sos-pulse-ring"></div>
            </>
          )}
          <button
            className="sos-trigger-btn"
            onClick={handleTriggerSOS}
            disabled={status !== 'IDLE'}
          >
            <AlertTriangle size={38} />
            <span>{status === 'IDLE' ? 'TRIGGER SOS' : 'ALERT SENT'}</span>
          </button>
        </div>

        {/* Status Notifications */}
        {status !== 'IDLE' && (
          <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.04)', padding: '1.2rem', borderRadius: 14, border: '1px solid var(--card-border)' }}>
            {status !== 'ASSIGNED' ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', color: '#f87171' }}>
                <div className="spinner"></div>
                <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{statusText}</span>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#34d399', marginBottom: '0.8rem' }}>
                  <CheckCircle size={22} />
                  <strong style={{ fontSize: '1.05rem' }}>Ambulance En Route</strong>
                </div>

                {assignedAmbulance && (
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 10, padding: '1rem', textAlign: 'left', fontSize: '0.9rem' }}>
                    <p><strong>🚑 Vehicle:</strong> {assignedAmbulance.vehicleNumber}</p>
                    <p style={{ margin: '0.3rem 0' }}><strong>👨‍✈️ Driver:</strong> {assignedAmbulance.driverName}</p>
                    <p><strong>📞 Phone:</strong> <a href={`tel:${assignedAmbulance.driverPhone}`} style={{ color: '#34d399', textDecoration: 'none' }}>{assignedAmbulance.driverPhone}</a></p>
                  </div>
                )}
              </div>
            )}

            {coords && (
              <p style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <MapPin size={13} /> {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              </p>
            )}
          </div>
        )}
      </div>
    </KineticGrid>
  );
}
