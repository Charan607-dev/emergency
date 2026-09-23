const HOSPITAL_ID = 'hosp_01';

const alertsContainer = document.getElementById('alertsContainer');
const ambulancesContainer = document.getElementById('ambulancesContainer');
const refreshBtn = document.getElementById('refreshBtn');

let availableAmbulances = [];

async function fetchDashboardData() {
    await fetchAmbulances();
    await fetchAlerts();
}

async function fetchAmbulances() {
    try {
        const res = await fetch(`/api/hospital/${HOSPITAL_ID}/ambulances`);
        const data = await res.json();
        availableAmbulances = data.data;

        if (availableAmbulances.length === 0) {
            ambulancesContainer.innerHTML = '<p class="empty-text">No available ambulances right now.</p>';
            return;
        }

        ambulancesContainer.innerHTML = availableAmbulances.map(amb => `
      <div class="ambulance-item">
        <div>
          <strong>${amb.vehicle_number}</strong><br>
          <small>Driver: ${amb.driver_name} (${amb.driver_phone})</small>
        </div>
        <span class="badge">AVAILABLE</span>
      </div>
    `).join('');
    } catch (err) {
        console.error("Error fetching ambulances:", err);
    }
}

async function fetchAlerts() {
    try {
        const res = await fetch(`/api/hospital/${HOSPITAL_ID}/alerts`);
        const data = await res.json();
        const alerts = data.data;

        if (alerts.length === 0) {
            alertsContainer.innerHTML = '<p class="empty-text">No pending emergency alerts.</p>';
            return;
        }

        alertsContainer.innerHTML = alerts.map(alert => {
            const ambulanceOptions = availableAmbulances.map(amb =>
                `<option value="${amb.ambulance_id}">${amb.vehicle_number} (${amb.driver_name})</option>`
            ).join('');

            return `
        <div class="alert-card">
          <h4>🚨 Emergency Request: ${alert.user_name}</h4>
          <p><strong>Phone:</strong> ${alert.user_phone}</p>
          <p><strong>Location:</strong> Lat ${alert.latitude}, Long ${alert.longitude}</p>
          
          <div class="assign-controls">
            <select id="select_${alert.request_id}">
              ${ambulanceOptions || '<option value="">No Ambulances Available</option>'}
            </select>
            <button onclick="assignAmbulance('${alert.request_id}')" ${availableAmbulances.length === 0 ? 'disabled' : ''}>
              Assign & Dispatch
            </button>
          </div>
        </div>
      `;
        }).join('');
    } catch (err) {
        console.error("Error fetching alerts:", err);
    }
}

async function assignAmbulance(requestId) {
    const selectElem = document.getElementById(`select_${requestId}`);
    const ambulanceId = selectElem.value;

    if (!ambulanceId) {
        alert("Please select an ambulance first!");
        return;
    }

    try {
        const res = await fetch('/api/sos/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                request_id: requestId,
                ambulance_id: ambulanceId
            })
        });

        const result = await res.json();
        if (result.success) {
            alert("Ambulance dispatched successfully!");
            fetchDashboardData(); // Refresh UI
        }
    } catch (err) {
        console.error("Error assigning ambulance:", err);
    }
}

refreshBtn.addEventListener('click', fetchDashboardData);

// Auto refresh hospital dashboard every 5 seconds
fetchDashboardData();
setInterval(fetchDashboardData, 5000);