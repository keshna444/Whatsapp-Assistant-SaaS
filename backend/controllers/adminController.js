const mongoose = require('mongoose');
const User = require('../models/User');
const BusinessProfile = require('../models/BusinessProfile');
const Appointment = require('../models/Appointment');
const Conversation = require('../models/Conversation');

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({}).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments({}),
    ]);

    // Attach whatsappConnected from BusinessProfile
    const userIds = users.map((u) => u._id);
    const profiles = await BusinessProfile.find({ owner: { $in: userIds } }).select('owner whatsappNumber');
    const profileMap = {};
    profiles.forEach((p) => { profileMap[p.owner.toString()] = p; });

    const usersWithMeta = users.map((u) => {
      const profile = profileMap[u._id.toString()];
      return {
        id: u._id,
        name: u.name,
        email: u.email,
        businessName: profile?.businessName || '',
        plan: u.plan,
        role: u.role,
        whatsappConnected: !!(profile?.whatsappNumber),
        createdAt: u.createdAt,
        suspended: u.suspended,
      };
    });

    res.json({ users: usersWithMeta, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = await BusinessProfile.findOne({ owner: user._id });

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      suspended: user.suspended,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      businessName: profile?.businessName || '',
      businessType: profile?.businessType || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      whatsappNumber: profile?.whatsappNumber || '',
      whatsappConnected: !!(profile?.whatsappNumber),
      isActive: profile?.isActive ?? true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/users/:id/suspend
const toggleSuspend = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.suspended = !user.suspended;
    await user.save();
    res.json({ id: user._id, suspended: user.suspended });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/admin/users/:id/plan
const updatePlan = async (req, res) => {
  const { plan } = req.body;
  if (!['starter', 'growth', 'pro'].includes(plan)) {
    return res.status(400).json({ error: 'Invalid plan. Must be starter, growth, or pro.' });
  }
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { plan },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user._id, plan: user.plan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profile = await BusinessProfile.findOne({ owner: user._id });
    if (profile) {
      await Promise.all([
        mongoose.model('Appointment').deleteMany({ business: profile._id }),
        mongoose.model('Service').deleteMany({ business: profile._id }),
        mongoose.model('Customer').deleteMany({ business: profile._id }),
        Conversation.deleteMany({ businessId: profile._id }),
      ]);
      await profile.deleteOne();
    }
    await user.deleteOne();
    res.json({ message: 'User and all related data deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/admin/users/:id/reset-password
const resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Password reset email requires a mailer integration not yet configured.
    // Return success so the frontend flow works; wire up nodemailer/SendGrid when ready.
    res.json({ message: `Password reset email would be sent to ${user.email}.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/whatsapp
const getWhatsappConnections = async (req, res) => {
  try {
    const profiles = await BusinessProfile.find({ whatsappNumber: { $exists: true, $ne: '' } })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    const connections = profiles.map((p) => ({
      userId: p.owner?._id,
      userName: p.owner?.name || '',
      userEmail: p.owner?.email || '',
      phoneNumber: p.whatsappNumber || '',
      metaStatus: 'pending',
      webhookStatus: 'unknown',
      apiStatus: 'unknown',
    }));

    res.json(connections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers, newSignupsLast7Days, allUsers] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.find({ createdAt: { $gte: thirtyDaysAgo } }).select('createdAt').sort({ createdAt: 1 }),
    ]);

    // Build daily signups for the last 30 days
    const dailySignups = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dailySignups[d.toISOString().slice(0, 10)] = 0;
    }
    allUsers.forEach((u) => {
      const key = new Date(u.createdAt).toISOString().slice(0, 10);
      if (key in dailySignups) dailySignups[key]++;
    });

    const signupChart = Object.entries(dailySignups).map(([date, count]) => ({ date, count }));

    res.json({
      totalUsers,
      activeUsers,
      messagesProcessed: 0,
      aiRepliesSent: 0,
      newSignupsLast7Days,
      mrr: 0,
      signupChart,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/admin/subscriptions
const getSubscriptions = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    const subscriptions = users.map((u) => ({
      userId: u._id,
      name: u.name,
      email: u.email,
      plan: u.plan,
      stripeStatus: null,
      amount: 0,
      nextBillingDate: null,
      stripeCustomerId: null,
    }));

    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  toggleSuspend,
  updatePlan,
  deleteUser,
  resetPassword,
  getWhatsappConnections,
  getAnalytics,
  getSubscriptions,
};
