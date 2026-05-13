const express = require('express');
const router = express.Router();
const {
  createProfile,
  getMyProfile,
  updateProfile,
  deleteProfile,
} = require('../controllers/businessController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', createProfile);
router.get('/me', getMyProfile);
router.put('/me', updateProfile);
router.delete('/me', deleteProfile);

// /profile aliases used by SettingsPage
router.get('/profile', getMyProfile);
router.post('/profile', createProfile);
router.put('/profile', updateProfile);

module.exports = router;
