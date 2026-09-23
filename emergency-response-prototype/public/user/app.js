const sosBtn = document.getElementById('sosBtn');
const statusContainer = document.getElementById('statusContainer');
const statusMessage = document.getElementById('statusMessage');
const statusSpinner = document.getElementById('statusSpinner');
const ambulanceDetails = document.getElementById('ambulanceDetails');

let activeRequestId = null;

sosBtn.addEventListener('click', () => {
    const userName = document.getElementById('userName').value;
    const userPhone = document.getElementById('userPhone').value;

    sosBtn.disabled = true;
    sosBtn.style.opacity = '0.5';
    statusContainer.classList.remove('hidden');

    // Fetch geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => sendSOS(position.coords.latitude, position.coords.longitude, userName, userPhone),
            () => sendSOS(12.9716, 77.5946, userName, userPhone) // Fallback coordinates if user denies GPS permission
        );
    } else {
        sendSOS(12.9716, 77.5946, userName, userPhone);
    }
});

async function sendSOS(lat, long, name, phone) {
    try {
        const response = await fetch('/api/sos/trigger', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_name: name,
                user_phone: phone,
                latitude: lat,
                longitude: long,
                hospital_id: 'hosp_01'
            })
        });

        const result = await response.json();

        if (result.success) {
            activeRequestId = result.data.request_id;
            statusMessage.innerText = "SOS Sent! Waiting for hospital to assign an ambulance...";

            // Poll server every 3 seconds to check if ambulance is assigned
            startStatusCheck();
        }
    } catch (error) {
        statusMessage.innerText = "Failed to send SOS alert. Please try again.";
        sosBtn.disabled = false;
        sosBtn.style.opacity = '1';
    }
}

function startStatusCheck() {
    const interval = setInterval(async () => {
        if (!activeRequestId) return;

        try {
            // Check hospital alerts endpoint to see if ambulance status changed
            const res = await fetch('/api/hospital/hosp_01/alerts');
            const data = await res.json();

            const myRequest = data.data.find(r => r.request_id === activeRequestId);

            // If request is no longer in "PENDING", it means it got assigned
            if (!myRequest) {
                statusSpinner.classList.add('hidden');
                statusMessage.innerText = "🚨 Ambulance Dispatched & On The Way!";
                ambulanceDetails.classList.remove('hidden');
                ambulanceDetails.innerHTML = `
          <strong>Assigned Ambulance:</strong> KA-01-EQ-1234<br>
          <strong>Driver:</strong> Ramesh Kumar<br>
          <strong>Contact:</strong> 9876543210
        `;
                clearInterval(interval);
            }
        } catch (err) {
            console.error("Error polling status:", err);
        }
    }, 3000);
}