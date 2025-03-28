const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getSchemaOptions,
  getNearbyDestinations
} = require('../Controllers/destinationController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateActivity } = require('../middleware/validationMiddleware');

// Public routes - no authentication needed
router.get('/schema-options', getSchemaOptions);
router.get('/activities', getActivities);
router.get('/activities/:id', getActivity);
router.get('/nearby', getNearbyDestinations);
router.get('/', getDestinations);
router.get('/:id', getDestination);

// Protected admin routes - require authentication and admin role
router.use(protect);
router.use(admin);

// Admin routes for destinations
router.post('/', createDestination);
router.put('/:id', updateDestination);
router.delete('/:id', deleteDestination);

// Admin routes for activities
router.post('/activities', validateActivity, createActivity);
router.put('/activities/:id', validateActivity, updateActivity);
router.delete('/activities/:id', deleteActivity);

module.exports = router;
