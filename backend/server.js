require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const customerRoutes = require('./routes/customerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const seedRoutes = require('./routes/seedRoutes');
const { dbCheck } = require('./middleware/dbCheck');

const app = express();

connectDB();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

// Auth works in demo mode when DB is offline (returns a demo token)
app.use('/api/auth', authRoutes);
// Business profile requires a live DB connection
app.use('/api/business', dbCheck, businessRoutes);

// These routes work in demo mode — controllers fall back to in-memory store when DB is offline
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/seed', seedRoutes);
app.use('/webhook', webhookRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'WhatsApp Assistant API is running.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
