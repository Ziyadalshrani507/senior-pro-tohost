const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
  getItems,
  batchDelete,
  getSchemaOptions
} = require('../controllers/dashboardController');

// All routes are protected and require admin access
router.use(protect, admin);

// Get items with filtering, sorting, and pagination
router.get('/items', getItems);

// Batch delete items
router.delete('/items', batchDelete);

// Get schema options for dropdowns
router.get('/schema-options', getSchemaOptions);

module.exports = router;
