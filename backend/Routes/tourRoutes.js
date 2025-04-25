const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getTours,
  createTour,
  updateTour,
  deleteTour
} = require('../controllers/tourController');

// Get all tours
router.get('/', protect, admin, getTours);

// Create a new tour
router.post('/', protect, admin, createTour);

// Update a tour
router.put('/:id', protect, admin, updateTour);

// Delete a tour
router.delete('/:id', protect, admin, deleteTour);

module.exports = router;