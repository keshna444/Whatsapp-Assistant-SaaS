require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const socketManager = require('./socket/socketManager');

const authRoutes = require('./routes/authRoutes');
const businessRoutes = require('./routes/businessRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const chatRoutes = require('./routes/chatRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const customerRoutes = require('./routes/customerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');
const seedRoutes = require('./routes/seedRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { dbCheck } = require('./middleware/dbCheck');

const app = express();

connectDB();

const corsOptions = {
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
};

app.use(cors(corsOptions));
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
app.use('/api/messages', messageRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/admin', adminRoutes);
app.use('/webhook', webhookRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'WhatsApp Assistant API is running.' });
});

// Wrap Express in an HTTP server so Socket.IO can share the same port
const httpServer = http.createServer(app);

// Initialize Socket.IO — all controllers access it via socketManager.getIO()
socketManager.init(httpServer, corsOptions);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
