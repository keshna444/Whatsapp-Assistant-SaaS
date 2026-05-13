const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const demoStore = require('../store/demoStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getAppointments = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json([...demoStore.appointments].sort(
        (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
      ));
    }
    const appointments = await Appointment.find().sort({ appointmentDate: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAppointment = async (req, res) => {
  const { customerName, customerPhone, service, appointmentDate, notes, source, price } = req.body;

  if (!customerName || !customerPhone || !service || !appointmentDate) {
    return res.status(400).json({ message: 'Customer name, phone, service and date are required.' });
  }

  try {
    if (!isDbConnected()) {
      const appt = {
        _id: demoStore.nextId(),
        customerName,
        customerPhone,
        service,
        appointmentDate,
        notes: notes || '',
        price: price || 0,
        source: source || 'web',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      demoStore.appointments.push(appt);
      return res.status(201).json(appt);
    }

    const appointment = await Appointment.create({
      customerName,
      customerPhone,
      service,
      appointmentDate,
      notes,
      price: price || 0,
      source: source || 'web',
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    if (!isDbConnected()) {
      const idx = demoStore.appointments.findIndex(a => a._id === id);
      if (idx === -1) return res.status(404).json({ message: 'Appointment not found.' });
      demoStore.appointments[idx] = {
        ...demoStore.appointments[idx],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      return res.json(demoStore.appointments[idx]);
    }
    const appointment = await Appointment.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    if (!isDbConnected()) {
      const idx = demoStore.appointments.findIndex(a => a._id === id);
      if (idx === -1) return res.status(404).json({ message: 'Appointment not found.' });
      demoStore.appointments[idx].status = status;
      demoStore.appointments[idx].updatedAt = new Date().toISOString();
      return res.json(demoStore.appointments[idx]);
    }
    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    if (!isDbConnected()) {
      const idx = demoStore.appointments.findIndex(a => a._id === id);
      if (idx === -1) return res.status(404).json({ message: 'Appointment not found.' });
      demoStore.appointments.splice(idx, 1);
      return res.json({ message: 'Appointment deleted.' });
    }
    const appointment = await Appointment.findByIdAndDelete(id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found.' });
    res.json({ message: 'Appointment deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
};
