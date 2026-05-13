const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} = require('../controllers/appointmentController');

router.get('/', getAppointments);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.delete('/:id', deleteAppointment);

module.exports = router;
