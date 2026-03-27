const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── Register ──────────────────────────────────────────────────────────────────
// Now: stores user as 'pending', does NOT issue token
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const {
      name, email, password, confirmPassword, role,
      collegeId, department, graduationYear,
      currentYear, enrollmentYear
    } = req.body;

    // Role check
    if (!['student', 'alumni'].includes(role)) {
      return res.status(400).json({ message: 'Role must be student or alumni' });
    }

    // Password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // College ID required
    if (!collegeId || !/^[A-Za-z0-9\-_]{3,20}$/.test(collegeId)) {
      return res.status(400).json({ message: 'College ID must be 3–20 alphanumeric characters' });
    }

    // Alumni must have past graduation year
    if (role === 'alumni') {
      const year = parseInt(graduationYear);
      if (!year || year > new Date().getFullYear()) {
        return res.status(400).json({ message: 'Alumni graduation year cannot be in the future' });
      }
    }

    // Check duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Check duplicate College ID for same role
    const existingCollegeId = await User.findOne({ collegeId: collegeId.toUpperCase(), role });
    if (existingCollegeId) {
      return res.status(400).json({ message: `This College ID is already registered as ${role}` });
    }

    // Build user data
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      department,
      collegeId: collegeId.toUpperCase().trim(),
      approvalStatus: 'pending',
    };

    if (role === 'student') {
      userData.currentYear = currentYear;
      userData.enrollmentYear = enrollmentYear;
    } else if (role === 'alumni') {
      userData.graduationYear = graduationYear;
    }

    const user = new User(userData);
    await user.save();

    // Do NOT issue token — user must wait for admin approval
    res.status(201).json({
      success: true,
      message: 'Registration submitted! Your account is pending admin approval. You will be notified once reviewed.',
      userId: user._id,
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email is already registered' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// ─── Login ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated. Please contact admin.' });
    }

    // ── Approval gate ──
    if (user.approvalStatus === 'pending') {
      return res.status(403).json({
        message: 'Your account is pending admin approval. Please wait for review.',
        approvalStatus: 'pending',
      });
    }
    if (user.approvalStatus === 'rejected') {
      return res.status(403).json({
        message: `Your registration was not approved.${user.approvalNote ? ' Reason: ' + user.approvalNote : ' Please contact the admin.'}`,
        approvalStatus: 'rejected',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        collegeId: user.collegeId,
        graduationYear: user.graduationYear,
        currentCompany: user.currentCompany,
        currentPosition: user.currentPosition,
        currentYear: user.currentYear,
        enrollmentYear: user.enrollmentYear,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// ─── Get Profile ───────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Update Profile ────────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.approvalStatus;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

// ─── Change Password ───────────────────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
};

// ─── Admin: Get All Users ──────────────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const { role, department, status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (status) query.approvalStatus = status;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);
    res.json({ users, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Admin: Get Pending Registrations ─────────────────────────────────────────
const getPendingUsers = async (req, res) => {
  try {
    const pending = await User.find({ approvalStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: pending.length, users: pending });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Admin: Approve or Reject User ────────────────────────────────────────────
const approveUser = async (req, res) => {
  try {
    const { action, note } = req.body;
    const { userId } = req.params;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Action must be approve or reject' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.approvalStatus !== 'pending') {
      return res.status(400).json({ message: `User has already been ${user.approvalStatus}` });
    }

    user.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    user.approvalNote = note || '';
    user.approvedBy = req.user.id;
    user.approvedAt = new Date();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: `User ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      user,
    });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Admin: Toggle User Active Status ─────────────────────────────────────────
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot deactivate your own account' });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`, user: { id: user._id, name: user.name, isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── Admin: Delete User ────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  register, login, getProfile, updateProfile, changePassword,
  getAllUsers, getPendingUsers, approveUser, toggleUserStatus, deleteUser
};
