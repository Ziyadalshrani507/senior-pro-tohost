const express = require('express');
const router = express.Router();
const { requestPasswordReset, resetPassword } = require('../Controllers/passwordResetController'); // Corrected import path

router.post('/request-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;


// Routes for password reset functionality.
// This includes requesting a password reset and resetting the password.
// Handles password reset-related operations (requesting reset, resetting password, etc.).
// This controller manages password reset requests and the actual password reset process.