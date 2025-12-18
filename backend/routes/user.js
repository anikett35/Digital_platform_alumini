// backend/routes/user.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const User = require('../models/User');

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update user profile
router.put('/update', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    console.log('=== Profile Update Request ===');
    console.log('User ID:', userId);
    console.log('Update Data:', JSON.stringify(updateData, null, 2));
    
    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Define allowed fields for update
    const allowedUpdates = [
      'name', 'phoneNumber', 'location', 'department', 'bio', 'profileHeadline',
      'skills', 'interests', 'linkedinUrl', 'githubUrl', 'website',
      'profileImage', 'coverPhoto', 'currentYear', 'enrollmentYear',
      'graduationYear', 'currentCompany', 'currentPosition', 'industry',
      'workExperience', 'education', 'careerGoals', 'industryPreferences',
      'lookingForMentor', 'availableAsMentor', 'mentorshipAreas',
      'isOpenToMentorship', 'profileVisibility', 'photoGallery'
    ];
    
    // Update only allowed fields
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        user[field] = updateData[field];
      }
    });
    
    // Calculate and update profile strength
    user.profileStrength = user.calculateProfileStrength();
    user.profileComplete = user.profileStrength >= 70;
    user.lastProfileUpdate = new Date();
    
    await user.save();
    
    console.log('Profile updated successfully');
    console.log('Profile Strength:', user.profileStrength);
    
    const updatedUser = await User.findById(userId).select('-password');
    
    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('=== Profile Update Error ===');
    console.error('Error:', error);
    console.error('Error Stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get user by ID (public profile)
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check visibility
    if (user.profileVisibility === 'private' && user._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Profile is private' 
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { query, role, department, skills } = req.query;
    
    let filter = { isActive: true };
    
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } },
        { profileHeadline: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (skills) filter.skills = { $in: skills.split(',') };
    
    const users = await User.find(filter)
      .select('-password')
      .limit(50)
      .sort({ profileStrength: -1, createdAt: -1 });
    
    res.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update profile image
router.put('/profile-image', auth, async (req, res) => {
  try {
    const { profileImage } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage, lastProfileUpdate: new Date() },
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      message: 'Profile image updated',
      user
    });
  } catch (error) {
    console.error('Update profile image error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Add photo to gallery
router.post('/photo-gallery', auth, async (req, res) => {
  try {
    const { url, caption } = req.body;
    
    const user = await User.findById(req.user.id);
    
    user.photoGallery.push({
      url,
      caption: caption || '',
      uploadedAt: new Date()
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Photo added to gallery',
      photoGallery: user.photoGallery
    });
  } catch (error) {
    console.error('Add photo error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Delete photo from gallery
router.delete('/photo-gallery/:photoId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    user.photoGallery = user.photoGallery.filter(
      photo => photo._id.toString() !== req.params.photoId
    );
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Photo removed from gallery',
      photoGallery: user.photoGallery
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;
