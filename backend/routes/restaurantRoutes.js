const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const {
    getRestaurants,
    getCities,
    createRestaurant,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant,
    getSchemaOptions
} = require('../Controllers/restaurantController');

// Public routes
router.get('/', getRestaurants);
router.get('/cities', getCities);
router.get('/schema-options', getSchemaOptions);
router.get('/:id', getRestaurantById);

// Protected admin routes
router.post('/', protect, admin, createRestaurant);
router.put('/:id', protect, admin, updateRestaurant);
router.delete('/:id', protect, admin, deleteRestaurant);

module.exports = router;
