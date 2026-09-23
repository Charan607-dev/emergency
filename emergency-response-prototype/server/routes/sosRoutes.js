const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/jsonStorage');

// 1. TRIGGER SOS
router.post('/trigger', (req, res) => {
    const { user_name, user_phone, latitude, longitude, hospital_id } = req.body;
    const db = readData();

    const newSOS = {
        request_id: `req_${Date.now()}`,
        user_name: user_name || "Rahul (Test)",
        user_phone: user_phone || "9876543210",
        hospital_id: hospital_id || "hosp_01",
        assigned_ambulance_id: null,
        latitude,
        longitude,
        status: "PENDING",
        created_at: new Date().toISOString()
    };

    db.sos_requests.push(newSOS);
    writeData(db);

    res.status(201).json({ success: true, message: "SOS Sent!", data: newSOS });
});

// 2. ASSIGN AMBULANCE
router.post('/assign', (req, res) => {
    const { request_id, ambulance_id } = req.body;
    const db = readData();

    const sosIndex = db.sos_requests.findIndex(r => r.request_id === request_id);
    const ambIndex = db.ambulances.findIndex(a => a.ambulance_id === ambulance_id);

    if (sosIndex === -1 || ambIndex === -1) {
        return res.status(404).json({ success: false, message: "Request or Ambulance not found" });
    }

    db.sos_requests[sosIndex].assigned_ambulance_id = ambulance_id;
    db.sos_requests[sosIndex].status = "ASSIGNED";
    db.ambulances[ambIndex].status = "DISPATCHED";

    writeData(db);

    res.status(200).json({ success: true, message: "Ambulance Dispatched!" });
});
// ====================================================================
// 3. DRIVER MARKS TRIP AS COMPLETED / REACHED
// POST /api/sos/complete
// ====================================================================
router.post('/complete', (req, res) => {
    const { ambulance_id } = req.body;
    const db = readData();

    // 1. Find active request for this ambulance and set to COMPLETED
    const sosIndex = db.sos_requests.findIndex(
        r => r.assigned_ambulance_id === ambulance_id && r.status === "ASSIGNED"
    );

    if (sosIndex !== -1) {
        db.sos_requests[sosIndex].status = "COMPLETED";
    }

    // 2. Set ambulance back to AVAILABLE
    const ambIndex = db.ambulances.findIndex(a => a.ambulance_id === ambulance_id);
    if (ambIndex !== -1) {
        db.ambulances[ambIndex].status = "AVAILABLE";
    } else {
        return res.status(404).json({ success: false, message: "Ambulance not found" });
    }

    writeData(db);

    res.status(200).json({
        success: true,
        message: "Trip completed! Ambulance is now marked as AVAILABLE."
    });
});

module.exports = router;