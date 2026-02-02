const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───
app.use(cors());
app.use(express.json());

// ─── Health Check ───
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'UniCycle Backend is running!',
        timestamp: new Date().toISOString()
    });
});

// ─── Routes (will add as we build) ───
// app.use('/api/auth',     require('./routes/auth'));
// app.use('/api/listings', require('./routes/listings'));
// app.use('/api/messages', require('./routes/messages'));
// app.use('/api/users',    require('./routes/users'));

// ─── Start Server ───
app.listen(PORT, () => {
    console.log(`🚀 UniCycle Backend running on http://localhost:${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
});