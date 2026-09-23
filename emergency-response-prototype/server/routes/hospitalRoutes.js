const express = require('express');
const router = express.Router();
const { readData } = require('../utils/jsonStorage');

// GET PENDING ALERTS
router.get('/:hospital_id/alerts', (req, res) => {
    const db = readData();
    const alerts = db.sos_requests.filter(
        r => r.hospital_id === req.params.hospital_id && r.status === "PENDING"
    );
    res.json({ success: true, data: alerts });
});

// GET AVAILABLE AMBULANCES
router.get('/:hospital_id/ambulances', (req, res) => {
    const db = readData();
    const ambulances = db.ambulances.filter(
        a => a.hospital_id === req.params.hospital_id && a.status === "AVAILABLE"
    );
    res.json({ success: true, data: ambulances });
});

module.exports = router;