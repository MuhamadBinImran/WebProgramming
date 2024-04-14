// userRoutes.js
const express = require('express');
const router = express.Router();

// Define routes
router.post('/register', (req, res) => {
    // Your registration logic here
    res.send('User registered successfully');
});

// Export router
module.exports = router;
