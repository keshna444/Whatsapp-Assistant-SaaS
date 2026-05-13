const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const demoStore = require('../store/demoStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getCustomers = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.json(demoStore.customers);
    }
    let customers = await Customer.find().sort({ name: 1 });
    if (customers.length === 0) {
      const seeds = demoStore.customers.map(({ _id, ...c }) => c);
      await Customer.insertMany(seeds);
      customers = await Customer.find().sort({ name: 1 });
    }
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createCustomer = async (req, res) => {
  const { name, phone, email, notes } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ message: 'Name and phone are required.' });
  }

  try {
    if (!isDbConnected()) {
      const customer = {
        _id: demoStore.nextId(),
        name,
        phone,
        email: email || '',
        totalBookings: 0,
        totalSpent: 0,
        lastVisit: null,
        status: 'new',
        notes: notes || '',
        createdAt: new Date().toISOString(),
      };
      demoStore.customers.push(customer);
      return res.status(201).json(customer);
    }
    const customer = await Customer.create({ name, phone, email, notes });
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    if (!isDbConnected()) {
      const idx = demoStore.customers.findIndex(c => c._id === id);
      if (idx === -1) return res.status(404).json({ message: 'Customer not found.' });
      demoStore.customers[idx] = { ...demoStore.customers[idx], ...req.body };
      return res.json(demoStore.customers[idx]);
    }
    const customer = await Customer.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    if (!isDbConnected()) {
      const idx = demoStore.customers.findIndex(c => c._id === id);
      if (idx === -1) return res.status(404).json({ message: 'Customer not found.' });
      demoStore.customers.splice(idx, 1);
      return res.json({ message: 'Customer deleted.' });
    }
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) return res.status(404).json({ message: 'Customer not found.' });
    res.json({ message: 'Customer deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getCustomers, createCustomer, updateCustomer, deleteCustomer };
