const express = require('express');
const cors = require('cors');
const path = require('path');

const sosRoutes = require('./routes/sosRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files directly
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/sos', sosRoutes);
app.use('/api/hospital', hospitalRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Prototype running on http://localhost:${PORT}`);
    console.log(`📱 User SOS Page: http://localhost:${PORT}/user`);
    console.log(`🏥 Hospital Dashboard: http://localhost:${PORT}/hospital`);
});