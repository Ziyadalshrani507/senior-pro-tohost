const express = require('express');
const router = express.Router();
const { signup, signin } = require('../Controllers/authController');
const { validateSignup, validateSignin } = require('../middleware/validationMiddleware');

router.post('/signup', validateSignup, signup);
router.post('/signin', validateSignin, signin);

module.exports = router;
