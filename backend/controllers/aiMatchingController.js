// backend/controllers/aiMatchingController.js
const User = require('../models/User');
const Student = require('../models/Student');
const Alumni = require('../models/Alumni');
const MentorshipMatch = require('../models/MentorshipMatch');

// AI Matching Engine
class AIMatchingEngine {
  static calculateArraySimilarity(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
    const set1 = new Set(arr1.map(item => item.toLowerCase()));
    const set2 = new Set(arr2.map(item => item.toLowerCase()));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return (intersection.size / union.size) * 100;
  }

  static calculateTextSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    return this.calculateArraySimilarity(words1, words2);
  }

  static calculateMatchScore(studentProfile, alumniProfile) {
    const weights = {
      skills: 0.30,
      interests: 0.25,
      industry: 0.20,
      careerGoals: 0.15,
      department: 0.10
    };

    const skillsMatch = this.calculateArraySimilarity(
      studentProfile.skills || [], 
      alumniProfile.skills || []
    );
    
    const interestsMatch = this.calculateArraySimilarity(
      studentProfile.interests || [], 
      alumniProfile.interests || []
    );
    
    const industryMatch = this.calculateArraySimilarity(
      studentProfile.industryPreferences || [], 
      [alumniProfile.currentCompany, alumniProfile.industry].filter(Boolean)
    );
    
    const careerGoalsMatch = this.calculateTextSimilarity(
      (studentProfile.careerGoals || []).join(' '), 
      (alumniProfile.mentorshipAreas || []).join(' ')
    );
    
    const departmentMatch = (studentProfile.department === alumniProfile.department) ? 100 : 0;

    const finalScore = (
      skillsMatch * weights.skills +
      interestsMatch * weights.interests +
      industryMatch * weights.industry +
      careerGoalsMatch * weights.careerGoals +
      departmentMatch * weights.department
    );

    return {
      finalScore: Math.round(finalScore),
      breakdown: {
        skillsMatch: Math.round(skillsMatch),
        interestsMatch: Math.round(interestsMatch),
        industryMatch: Math.round(industryMatch),
        careerGoalsMatch: Math.round(careerGoalsMatch),
        departmentMatch: Math.round(departmentMatch)
      }
    };
  }
}

// Get user profile (from correct model based on role)
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let profile;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId }).lean();
    } else if (user.role === 'alumni') {
      profile = await Alumni.findOne({ userId }).lean();
    }
    
    res.status(200).json({
      success: true,
      user: { ...user.toObject(), profile }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update user profile (to correct model based on role)
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`Updating ${user.role} profile for user:`, userId);

    // Calculate profile strength
    let filledFields = 0;
    const totalFields = 12;
    
    if (updateData.bio?.trim()) filledFields++;
    if (updateData.skills?.length > 0) filledFields++;
    if (updateData.interests?.length > 0) filledFields++;
    if (updateData.location?.trim()) filledFields++;
    if (updateData.profileHeadline?.trim()) filledFields++;
    if (updateData.linkedinUrl?.trim()) filledFields++;
    if (updateData.githubUrl?.trim()) filledFields++;
    
    // Role-specific fields
    if (user.role === 'student') {
      if (updateData.careerGoals?.length > 0) filledFields++;
      if (updateData.industryPreferences?.length > 0) filledFields++;
      if (updateData.currentYear) filledFields++;
      if (updateData.enrollmentYear) filledFields++;
      if (updateData.department?.trim()) filledFields++;
    } else if (user.role === 'alumni') {
      if (updateData.currentPosition?.trim()) filledFields++;
      if (updateData.currentCompany?.trim()) filledFields++;
      if (updateData.industry?.trim()) filledFields++;
      if (updateData.graduationYear) filledFields++;
      if (updateData.mentorshipAreas?.length > 0) filledFields++;
    }
    
    const profileStrength = Math.min((filledFields / totalFields) * 100, 100);
    
    // Prepare profile data
    const profileData = {
      fullName: user.name,
      email: user.email,
      bio: updateData.bio,
      location: updateData.location,
      skills: updateData.skills,
      interests: updateData.interests,
      linkedinUrl: updateData.linkedinUrl,
      githubUrl: updateData.githubUrl,
      profileHeadline: updateData.profileHeadline,
      profileStrength,
      profileComplete: profileStrength >= 70,
      lastProfileUpdate: new Date()
    };

    let profile;
    
    if (user.role === 'student') {
      // Student-specific fields
      profileData.currentYear = updateData.currentYear;
      profileData.enrollmentYear = updateData.enrollmentYear;
      profileData.department = updateData.department || user.department;
      profileData.careerGoals = updateData.careerGoals;
      profileData.industryPreferences = updateData.industryPreferences;
      profileData.lookingForMentor = updateData.lookingForMentor;
      
      // Update or create Student profile
      profile = await Student.findOneAndUpdate(
        { userId },
        { $set: profileData },
        { new: true, upsert: true, runValidators: true }
      );
      
    } else if (user.role === 'alumni') {
      // Alumni-specific fields
      profileData.currentPosition = updateData.currentPosition;
      profileData.currentCompany = updateData.currentCompany;
      profileData.industry = updateData.industry;
      profileData.graduationYear = updateData.graduationYear;
      profileData.department = updateData.department || user.department;
      profileData.availableAsMentor = updateData.availableAsMentor;
      profileData.mentorshipAreas = updateData.mentorshipAreas;
      profileData.yearsOfExperience = updateData.yearsOfExperience;
      
      // Update or create Alumni profile
      profile = await Alumni.findOneAndUpdate(
        { userId },
        { $set: profileData },
        { new: true, upsert: true, runValidators: true }
      );
    }
    
    // Also update basic fields in User model
    user.profileStrength = profileStrength;
    user.profileComplete = profileStrength >= 70;
    user.lastProfileUpdate = new Date();
    if (updateData.currentCompany) user.currentCompany = updateData.currentCompany;
    if (updateData.currentPosition) user.currentPosition = updateData.currentPosition;
    if (updateData.skills) user.skills = updateData.skills;
    if (updateData.interests) user.interests = updateData.interests;
    if (updateData.bio) user.bio = updateData.bio;
    
    await user.save();
    
    console.log(`${user.role} profile updated successfully`);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: { ...user.toObject(), profile }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
};

// Get AI mentor suggestions
exports.getAIMentorSuggestions = async (req, res) => {
  try {
    const studentUserId = req.user.id;
    const { limit = 10, minScore = 40 } = req.query;

    // Get student profile
    const studentProfile = await Student.findOne({ userId: studentUserId });
    if (!studentProfile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please complete your student profile first' 
      });
    }

    // Get available mentors
    const alumniProfiles = await Alumni.find({
      availableAsMentor: true,
      userId: { $ne: studentUserId }
    }).populate('userId', 'name email');

    // Calculate match scores
    const matches = alumniProfiles.map(alumniProfile => {
      const { finalScore, breakdown } = AIMatchingEngine.calculateMatchScore(
        studentProfile, 
        alumniProfile
      );
      
      return {
        mentor: {
          _id: alumniProfile.userId._id,
          name: alumniProfile.fullName,
          email: alumniProfile.email,
          currentCompany: alumniProfile.currentCompany,
          currentPosition: alumniProfile.currentPosition,
          department: alumniProfile.department,
          skills: alumniProfile.skills,
          mentorshipAreas: alumniProfile.mentorshipAreas,
          profileHeadline: alumniProfile.profileHeadline
        },
        matchScore: finalScore,
        matchFactors: breakdown
      };
    });

    // Filter and sort
    const filteredMatches = matches
      .filter(m => m.matchScore >= minScore)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit));

    // Save suggested matches
    await Promise.all(filteredMatches.map(async match => {
      const existing = await MentorshipMatch.findOne({ 
        student: studentUserId, 
        mentor: match.mentor._id 
      });
      
      if (!existing) {
        return MentorshipMatch.create({
          student: studentUserId,
          mentor: match.mentor._id,
          matchScore: match.matchScore,
          matchFactors: match.matchFactors,
          status: 'suggested'
        });
      }
      return existing;
    }));

    res.json({
      success: true,
      message: 'AI mentor suggestions generated successfully',
      suggestions: filteredMatches,
      totalFound: filteredMatches.length
    });

  } catch (error) {
    console.error('AI matching error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error generating mentor suggestions',
      error: error.message 
    });
  }
};

// Send mentorship request
exports.sendMentorshipRequest = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { mentorId, message, topic } = req.body;

    let match = await MentorshipMatch.findOne({ 
      student: studentId, 
      mentor: mentorId 
    });

    if (!match) {
      const studentProfile = await Student.findOne({ userId: studentId });
      const alumniProfile = await Alumni.findOne({ userId: mentorId });
      
      const { finalScore, breakdown } = AIMatchingEngine.calculateMatchScore(
        studentProfile, 
        alumniProfile
      );

      match = new MentorshipMatch({
        student: studentId,
        mentor: mentorId,
        matchScore: finalScore,
        matchFactors: breakdown
      });
    }

    match.status = 'pending';
    match.requestMessage = message;
    match.mentorshipTopic = topic;
    match.requestedAt = new Date();
    await match.save();
    await match.populate('mentor', 'name email');

    res.json({ 
      success: true,
      message: 'Mentorship request sent successfully', 
      match 
    });

  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error sending mentorship request' 
    });
  }
};

// Respond to mentorship request
exports.respondToMentorshipRequest = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { matchId, status, responseMessage } = req.body;

    const match = await MentorshipMatch.findOne({
      _id: matchId,
      mentor: mentorId,
      status: 'pending'
    });
    
    if (!match) {
      return res.status(404).json({ 
        success: false,
        message: 'Mentorship request not found' 
      });
    }

    match.status = status;
    match.responseMessage = responseMessage;
    match.respondedAt = new Date();
    if (status === 'accepted') match.startDate = new Date();

    await match.save();
    await match.populate('student', 'name email');

    res.json({ 
      success: true,
      message: `Mentorship request ${status}`, 
      match 
    });

  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error responding to request' 
    });
  }
};

// Get mentorship status
exports.getMentorshipStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const query = {};
    if (userRole === 'student') query.student = userId;
    else if (userRole === 'alumni') query.mentor = userId;

    const matches = await MentorshipMatch.find(query)
      .populate('student', 'name email')
      .populate('mentor', 'name email')
      .sort({ createdAt: -1 });

    const grouped = {
      suggested: matches.filter(m => m.status === 'suggested'),
      pending: matches.filter(m => m.status === 'pending'),
      accepted: matches.filter(m => m.status === 'accepted'),
      rejected: matches.filter(m => m.status === 'rejected'),
      completed: matches.filter(m => m.status === 'completed')
    };

    res.json({ 
      success: true,
      matches: grouped, 
      total: matches.length 
    });

  } catch (error) {
    console.error('Get mentorship status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching mentorship status' 
    });
  }
};

// Profile status
exports.getProfileStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    let profile;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId });
    } else {
      profile = await Alumni.findOne({ userId });
    }
    
    res.status(200).json({
      success: true,
      profileComplete: profile?.profileComplete || false,
      profileStrength: profile?.profileStrength || 0
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Alias
exports.updateMatchingProfile = exports.updateUserProfile;

// Analytics
exports.getMatchingAnalytics = async (req, res) => {
  try {
    const totalMatches = await MentorshipMatch.countDocuments();
    const acceptedMatches = await MentorshipMatch.countDocuments({ status: 'accepted' });
    const pendingRequests = await MentorshipMatch.countDocuments({ status: 'pending' });

    const avgMatchScore = await MentorshipMatch.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$matchScore' } } }
    ]);

    const topMatches = await MentorshipMatch.find({ status: 'accepted' })
      .sort({ matchScore: -1 })
      .limit(10)
      .populate('student', 'name')
      .populate('mentor', 'name');

    res.json({
      success: true,
      analytics: {
        totalMatches,
        acceptedMatches,
        pendingRequests,
        acceptanceRate: totalMatches > 0 ? (acceptedMatches / totalMatches * 100).toFixed(2) : 0,
        avgMatchScore: avgMatchScore[0]?.avgScore || 0
      },
      topMatches
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching analytics' 
    });
  }
};