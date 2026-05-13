const BusinessProfile = require('../models/BusinessProfile');

const createProfile = async (req, res) => {
  const { businessName, businessType, phone, address, description, whatsappNumber, openingDays, openingHours, bookingNotes, aiInstructions } = req.body;

  if (!businessName || !businessType) {
    return res.status(400).json({ message: 'Business name and type are required.' });
  }

  try {
    const existing = await BusinessProfile.findOne({ owner: req.user._id });
    if (existing) {
      return res.status(409).json({ message: 'A profile already exists for this account. Use PUT to update it.' });
    }

    const profile = await BusinessProfile.create({
      owner: req.user._id,
      businessName,
      businessType,
      phone,
      address,
      description,
      openingDays,
      openingHours,
      bookingNotes,
      aiInstructions,
      whatsappNumber,
    });

    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await BusinessProfile.findOne({ owner: req.user._id });
    if (!profile) return res.status(404).json({ message: 'No business profile found.' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const profile = await BusinessProfile.findOneAndUpdate(
      { owner: req.user._id },
      { $set: req.body },
      { new: true, runValidators: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    const profile = await BusinessProfile.findOneAndDelete({ owner: req.user._id });
    if (!profile) return res.status(404).json({ message: 'No business profile found.' });
    res.json({ message: 'Business profile deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createProfile, getMyProfile, updateProfile, deleteProfile };
