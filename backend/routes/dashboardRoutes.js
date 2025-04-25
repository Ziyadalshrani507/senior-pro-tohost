const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getItems,
  batchDelete,
  getSchemaOptions
} = require('../controllers/dashboardController');
const {
  getTours,
  createTour,
  updateTour,
  deleteTour
} = require('../controllers/tourController');

// All routes are protected and require admin access
router.use(protect, admin);

// Get items with filtering, sorting, and pagination
router.get('/items', getItems);

// Batch delete items
router.delete('/items', batchDelete);

// Get schema options for dropdowns
router.get('/schema-options', getSchemaOptions);

// Tours management routes
router.get('/tours', getTours);
router.post('/tours', createTour);
router.put('/tours/:id', updateTour);
router.delete('/tours/:id', deleteTour);

module.exports = router;
