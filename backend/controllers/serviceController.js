const mongoose = require('mongoose');
const Service = require('../models/Service');
const demoStore = require('../store/demoStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getServices = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json(demoStore.services);
    }
    let services = await Service.find().sort({ name: 1 });
    if (services.length === 0) {
      const seeds = demoStore.services.map(({ _id, ...s }) => s);
      await Service.insertMany(seeds);
      services = await Service.find().sort({ name: 1 });
    }
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createService = async (req, res) => {
  const { name, category, price, duration, description, status } = req.body;

  if (!name || price == null || duration == null) {
    return res.status(400).json({ message: 'Name, price, and duration are required.' });
  }

  try {
    if (!isDbConnected()) {
      const service = {
        _id: demoStore.nextId(),
        name,
        category: category || 'General',
        price: Number(price),
        duration: Number(duration),
        description: description || '',
        status: status || 'active',
        createdAt: new Date().toISOString(),
      };
      demoStore.services.push(service);
      return res.status(201).json(service);
    }
    const service = await Service.create({ name, category, price, duration, description, status });
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateService = async (req, res) => {
  const { id } = req.params;

  try {
    if (!isDbConnected()) {
      const idx = demoStore.services.findIndex(s => s._id === id);
      if (idx === -1) return res.status(404).json({ message: 'Service not found.' });
      demoStore.services[idx] = { ...demoStore.services[idx], ...req.body };
      return res.json(demoStore.services[idx]);
    }
    const service = await Service.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: 'Service not found.' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    if (!isDbConnected()) {
      const idx = demoStore.services.findIndex(s => s._id === id);
      if (idx === -1) return res.status(404).json({ message: 'Service not found.' });
      demoStore.services.splice(idx, 1);
      return res.json({ message: 'Service deleted.' });
    }
    const service = await Service.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });
    res.json({ message: 'Service deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getServices, createService, updateService, deleteService };
