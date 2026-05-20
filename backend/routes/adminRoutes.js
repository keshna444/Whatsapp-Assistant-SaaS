const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/requireAdmin');
const {
  getUsers,
  getUserById,
  toggleSuspend,
  updatePlan,
  deleteUser,
  resetPassword,
  getWhatsappConnections,
  getAnalytics,
  getSubscriptions,
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect, requireAdmin);

// Users
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/suspend', toggleSuspend);
router.patch('/users/:id/plan', updatePlan);
router.delete('/users/:id', deleteUser);
router.post('/users/:id/reset-password', resetPassword);

// WhatsApp
router.get('/whatsapp', getWhatsappConnections);

// Analytics
router.get('/analytics', getAnalytics);

// Subscriptions
router.get('/subscriptions', getSubscriptions);

module.exports = router;
