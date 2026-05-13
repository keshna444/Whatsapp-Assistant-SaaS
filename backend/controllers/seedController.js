const mongoose = require('mongoose');
const Service = require('../models/Service');
const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');
const Conversation = require('../models/Conversation');

const seedDatabase = async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ message: 'Database not connected. Seed requires a live MongoDB connection.' });
  }

  try {
    await Promise.all([
      Service.deleteMany({}),
      Customer.deleteMany({}),
      Appointment.deleteMany({}),
      Conversation.deleteMany({}),
    ]);

    const services = await Service.insertMany([
      { name: 'Gel Manicure', category: 'Nails', price: 800, duration: 45, description: 'Long-lasting gel polish application', status: 'active' },
      { name: 'Full Set Lashes', category: 'Lashes', price: 1200, duration: 120, description: 'Full eyelash extension set', status: 'active' },
      { name: "Men's Haircut", category: 'Hair', price: 500, duration: 30, description: "Classic men's haircut and style", status: 'active' },
    ]);

    const customers = await Customer.insertMany([
      { name: 'Sarah Connor', phone: '+230 5123 4567', email: 'sarah@example.com', totalBookings: 12, totalSpent: 9600, lastVisit: new Date(Date.now() - 2 * 86400000), status: 'loyal', notes: '' },
      { name: 'John Smith', phone: '+230 5987 6543', email: 'john@example.com', totalBookings: 3, totalSpent: 1500, lastVisit: new Date(Date.now() - 7 * 86400000), status: 'active', notes: '' },
      { name: 'Emma Watson', phone: '+230 5555 1234', email: 'emma@example.com', totalBookings: 1, totalSpent: 1200, lastVisit: new Date(Date.now() + 86400000), status: 'new', notes: 'First time customer' },
    ]);

    const appointments = await Appointment.insertMany([
      { customerName: customers[0].name, customerPhone: customers[0].phone, service: services[0].name, appointmentDate: new Date(Date.now() + 2 * 3600000), status: 'confirmed', price: services[0].price, source: 'whatsapp' },
      { customerName: customers[1].name, customerPhone: customers[1].phone, service: services[2].name, appointmentDate: new Date(Date.now() + 5 * 3600000), status: 'confirmed', price: services[2].price, source: 'web' },
      { customerName: customers[2].name, customerPhone: customers[2].phone, service: services[1].name, appointmentDate: new Date(Date.now() + 26 * 3600000), status: 'pending', notes: 'First time customer', price: services[1].price, source: 'whatsapp' },
    ]);

    await Conversation.insertMany([
      {
        phone: customers[0].phone,
        name: customers[0].name,
        status: 'ai_active',
        unread: 0,
        lastMessage: 'Perfect, see you tomorrow!',
        messages: [
          { text: 'Hi, can I book a gel manicure for tomorrow?', sender: 'user' },
          { text: "Hello! I can help with that. We have slots available tomorrow. Type 'book' for details.", sender: 'bot' },
          { text: 'book', sender: 'user' },
          { text: "Great! To book, provide: 1. Full name 2. Phone 3. Service 4. Preferred date & time.", sender: 'bot' },
          { text: 'Perfect, see you tomorrow!', sender: 'user' },
        ],
      },
      {
        phone: customers[1].phone,
        name: '+230 5987 6543',
        status: 'human_needed',
        unread: 2,
        lastMessage: 'Do you offer balayage?',
        messages: [
          { text: 'Do you offer balayage?', sender: 'user' },
          { text: "I am your booking assistant. I can help with appointments and services. Type 'book' to get started.", sender: 'bot' },
          { text: 'No I specifically want to know about balayage', sender: 'user' },
        ],
      },
    ]);

    res.json({
      message: 'Database seeded successfully.',
      counts: {
        services: services.length,
        customers: customers.length,
        appointments: appointments.length,
        conversations: 2,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { seedDatabase };
