require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();

// ✅ Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins for local development, including null (file://)
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// ✅ Database
require('./database');

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/learning-path', require('./routes/learningPath'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/mentor', require('./routes/mentor'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/gamification', require('./routes/gamification'));

// Frontend Static Files
app.use(express.static(path.join(__dirname, '../frontend')));

// Debug endpoint to verify server version
app.get('/debug-version', (req, res) => res.send('vADVANCED_MENTOR_V2'));

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT} [vADVANCED_MENTOR_V2]`);
});