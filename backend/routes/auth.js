const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  toggleUserStatus,
  deleteUser
} = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['student', 'alumni', 'admin'])
    .withMessage('Invalid role'),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Student ID cannot be empty if provided'),
  body('graduationYear')
    .optional()
    .isInt({ min: 1950, max: 2030 })
    .withMessage('Please provide a valid graduation year'),
  body('currentYear')
    .optional()
    .isInt({ min: 1, max: 8 })
    .withMessage('Current year must be between 1 and 8'),
  body('enrollmentYear')
    .optional()
    .isInt({ min: 2000, max: 2030 })
    .withMessage('Please provide a valid enrollment year')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/change-password', auth, changePasswordValidation, changePassword);

// Admin only routes
router.get('/users', auth, adminOnly, getAllUsers);
router.put('/users/:userId/toggle-status', auth, adminOnly, toggleUserStatus);
router.delete('/users/:userId', auth, adminOnly, deleteUser);

// Test route to verify authentication
router.get('/test', auth, (req, res) => {
  res.json({
    message: 'Authentication successful',
    user: req.user
  });
});

module.exports = router;