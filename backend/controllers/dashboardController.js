const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Conversation = require('../models/Conversation');
const demoStore = require('../store/demoStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getDashboardStats = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const now = new Date();
      const upcoming = [...demoStore.appointments]
        .filter(a => new Date(a.appointmentDate) > now && a.status !== 'cancelled')
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
        .slice(0, 5);

      const revenue = demoStore.appointments.reduce((sum, a) => sum + (a.price || 0), 0);
      const aiHandledChats = demoStore.conversations.reduce((sum, c) => sum + c.messages.filter(m => m.sender === 'bot').length, 0);

      return res.json({
        totalBookings: demoStore.appointments.length,
        completedBookings: demoStore.appointments.filter(a => a.status === 'completed').length,
        upcomingCount: upcoming.length,
        totalCustomers: demoStore.customers.length,
        totalServices: demoStore.services.length,
        aiHandledChats,
        revenue,
        newCustomers: demoStore.customers.filter(c => c.status === 'new').length,
        upcomingAppointments: upcoming,
        recentAIActions: [
          { text: 'Booked Sarah C. for Gel Manicure', time: '2 mins ago', type: 'success' },
          { text: 'Answered pricing question from +230 5XXX', time: '15 mins ago', type: 'info' },
          { text: 'Handed over complex query to human', time: '1 hour ago', type: 'warning' },
        ],
      });
    }

    const now = new Date();
    const [
      totalBookings,
      completedBookings,
      totalCustomers,
      totalServices,
      totalConversations,
      upcoming,
      revenueResult,
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: 'completed' }),
      Customer.countDocuments(),
      Service.countDocuments(),
      Conversation.countDocuments(),
      Appointment.find({ appointmentDate: { $gte: now }, status: { $ne: 'cancelled' } })
        .sort({ appointmentDate: 1 })
        .limit(5),
      Appointment.aggregate([{ $group: { _id: null, total: { $sum: '$price' } } }]),
    ]);

    const revenue = revenueResult[0]?.total || 0;

    res.json({
      totalBookings,
      completedBookings,
      upcomingCount: upcoming.length,
      totalCustomers,
      totalServices,
      aiHandledChats: totalConversations,
      revenue,
      newCustomers: await Customer.countDocuments({ status: 'new' }),
      upcomingAppointments: upcoming,
      recentAIActions: [
        { text: 'AI assistant is active and handling chats', time: 'Just now', type: 'success' },
      ],
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getDashboardStats };
