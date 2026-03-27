const express = require('express');
const { body } = require('express-validator');
const {
  register, login, getProfile, updateProfile, changePassword,
  getAllUsers, getPendingUsers, approveUser, toggleUserStatus, deleteUser
} = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').notEmpty().withMessage('Please confirm your password'),
  body('role').isIn(['student', 'alumni']).withMessage('Role must be student or alumni'),
  body('collegeId').trim().notEmpty().withMessage('College ID is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
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
router.get('/pending', auth, adminOnly, getPendingUsers);
router.patch('/approve/:userId', auth, adminOnly, approveUser);
router.put('/users/:userId/toggle-status', auth, adminOnly, toggleUserStatus);
router.delete('/users/:userId', auth, adminOnly, deleteUser);

// Auth test
router.get('/test', auth, (req, res) => res.json({ message: 'Authentication successful', user: req.user }));

module.exports = router;
