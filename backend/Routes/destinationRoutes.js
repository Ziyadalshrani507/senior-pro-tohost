const express = require('express');
const router = express.Router();
const {
  getActivities,
  getActivity,
  createActivity,
  updateActivity,
  deleteActivity,
  getSchemaOptions
} = require('../controllers/destinationController');
const { protect, admin } = require('../middleware/authMiddleware');
const { validateActivity } = require('../middleware/validationMiddleware');

// Public routes
router.get('/schema-options', getSchemaOptions);
router.get('/activities', getActivities);
router.get('/activities/:id', getActivity);

// Protected admin routes
router.use(protect); // Apply authentication middleware to all routes below
router.use(admin);   // Apply admin middleware to all routes below

router.post('/activities', validateActivity, createActivity);
router.put('/activities/:id', validateActivity, updateActivity);
router.delete('/activities/:id', deleteActivity);

module.exports = router;
