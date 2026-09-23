const ambulanceSelect = document.getElementById('ambulanceSelect');
const statusBox = document.getElementById('statusBox');
const statusText = document.getElementById('statusText');
const assignmentDetails = document.getElementById('assignmentDetails');
const patientName = document.getElementById('patientName');
const patientPhone = document.getElementById('patientPhone');
const patientLoc = document.getElementById('patientLoc');
const completeBtn = document.getElementById('completeBtn');

async function checkDriverStatus() {
    const ambulanceId = ambulanceSelect.value;

    try {
        // Fetch current alerts to check if assigned to this ambulance
        const res = await fetch('/api/hospital/hosp_01/alerts');
        const dbRes = await fetch(`/api/hospital/hosp_01/ambulances`);

        // We can also check raw JSON via custom endpoint or polling
        const ambRes = await fetch('/api/hospital/hosp_01/ambulances');
        const ambData = await ambRes.json();

        const isAvailable = ambData.data.some(a => a.ambulance_id === ambulanceId);

        if (isAvailable) {
            statusBox.className = "status-box available";
            statusText.innerText = "Status: AVAILABLE (Waiting for assignments)";
            assignmentDetails.classList.add('hidden');
        } else {
            statusBox.className = "status-box dispatched";
            statusText.innerText = "Status: DISPATCHED (Pickup active)";

            // Fetch details of active SOS request assigned to this ambulance
            fetchAssignmentData(ambulanceId);
        }
    } catch (err) {
        console.error("Error checking driver status:", err);
    }
}

async function fetchAssignmentData(ambulanceId) {
    try {
        // Fetch requests from API
        const res = await fetch('/api/hospital/hosp_01/alerts');
        // Note: If alert is assigned, we can display static/mock or extend API endpoint
        patientName.innerText = "Rahul (Test Victim)";
        patientPhone.innerText = "9876543210";
        patientLoc.innerText = "Lat 12.9716, Long 77.5946";
        assignmentDetails.classList.remove('hidden');
    } catch (err) {
        console.error(err);
    }
}

completeBtn.addEventListener('click', async () => {
    const ambulanceId = ambulanceSelect.value;

    try {
        const res = await fetch('/api/sos/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ambulance_id: ambulanceId })
        });

        const result = await res.json();
        if (result.success) {
            alert("Pickup marked as finished! You are now AVAILABLE.");
            checkDriverStatus();
        }
    } catch (err) {
        console.error("Error completing pickup:", err);
    }
});

ambulanceSelect.addEventListener('change', checkDriverStatus);

// Poll every 3 seconds
checkDriverStatus();
setInterval(checkDriverStatus, 3000);