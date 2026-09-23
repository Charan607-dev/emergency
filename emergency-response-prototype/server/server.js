const express = require('express');
const cors = require('cors');
const path = require('path');

const sosRoutes = require('./routes/sosRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Serve built React client if available
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

// API Routes
app.use('/api/sos', sosRoutes);
app.use('/api/hospital', hospitalRoutes);

// Fallback to React index.html for client-side routing
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const indexPath = path.join(clientDist, 'index.html');
    if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.json({ message: "ResQ Emergency API is running. Start the React dev server using 'npm run client'." });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Backend API running on http://localhost:${PORT}`);
    console.log(`⚛️ React App Dev Server: http://localhost:3000`);
});