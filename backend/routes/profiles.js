const express = require('express');
const router = express.Router();
// IMPORTANT: Use destructuring to get the function, not the whole object
const { auth } = require('../middleware/auth');
const { 
    getAlumniProfiles, 
    getAlumniProfile, 
    getSimilarAlumni 
} = require('../controllers/profileController');

// Define Routes
router.get('/alumni', auth, getAlumniProfiles);
router.get('/alumni/:id', auth, getAlumniProfile);
router.get('/alumni/:id/similar', auth, getSimilarAlumni);

module.exports = router;