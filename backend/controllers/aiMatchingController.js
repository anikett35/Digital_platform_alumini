// backend/controllers/aiMatchingController.js
// COMPLETE FIXED VERSION WITH BETTER DEBUGGING

const User = require('../models/User');
const Student = require('../models/Student');
const Alumni = require('../models/Alumni');
const MentorshipMatch = require('../models/MentorshipMatch');

// AI Matching Engine
class AIMatchingEngine {
  static calculateArraySimilarity(arr1, arr2) {
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
    const set1 = new Set(arr1.map(item => String(item).toLowerCase()));
    const set2 = new Set(arr2.map(item => String(item).toLowerCase()));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return (intersection.size / union.size) * 100;
  }

  static calculateTextSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    const words1 = String(text1).toLowerCase().split(/\s+/);
    const words2 = String(text2).toLowerCase().split(/\s+/);
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

exports.debugProfiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    
    console.log('=== DEBUG PROFILES ===');
    console.log('User ID:', userId);
    console.log('User Role:', user?.role);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findOne({ userId });
      console.log('Student Profile:', profile);
    } else if (user.role === 'alumni') {
      profile = await Alumni.findOne({ userId });
      console.log('Alumni Profile:', profile);
    }
    
    const studentCount = await Student.countDocuments();
    const alumniCount = await Alumni.countDocuments();
    const availableMentors = await Alumni.countDocuments({ availableAsMentor: true });
    
    console.log('Database Stats:');
    console.log('- Total Students:', studentCount);
    console.log('- Total Alumni:', alumniCount);
    console.log('- Available Mentors:', availableMentors);
    
    // Get all alumni profiles for debugging
    const allAlumni = await Alumni.find().populate('userId', 'name email');
    console.log('All Alumni Profiles:', allAlumni.map(a => ({
      name: a.fullName,
      availableAsMentor: a.availableAsMentor,
      skills: a.skills,
      company: a.currentCompany
    })));
    
    return res.json({
      success: true,
      currentUser: {
        id: userId,
        name: user.name,
        role: user.role,
        email: user.email
      },
      profile: profile,
      profileExists: !!profile,
      databaseStats: {
        totalStudents: studentCount,
        totalAlumni: alumniCount,
        availableMentors: availableMentors
      },
      allAlumniProfiles: allAlumni.map(a => ({
        name: a.fullName,
        email: a.email,
        availableAsMentor: a.availableAsMentor,
        skills: a.skills,
        company: a.currentCompany,
        mentorshipAreas: a.mentorshipAreas
      }))
    });
    
  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
};

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

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`Updating ${user.role} profile for user:`, userId);
    console.log('Update data:', updateData);

    let filledFields = 0;
    const totalFields = 12;
    
    if (updateData.bio?.trim()) filledFields++;
    if (updateData.skills?.length > 0) filledFields++;
    if (updateData.interests?.length > 0) filledFields++;
    if (updateData.location?.trim()) filledFields++;
    if (updateData.profileHeadline?.trim()) filledFields++;
    if (updateData.linkedinUrl?.trim()) filledFields++;
    if (updateData.githubUrl?.trim()) filledFields++;
    
    if (user.role === 'student') {
      if (updateData.careerGoals?.length > 0) filledFields++;
      if (updateData.industryPreferences?.length > 0) filledFields++;
      if (updateData.currentYear) filledFields++;
      if (updateData.enrollmentYear) filledFields++;
      if (user.department) filledFields++;
    } else if (user.role === 'alumni') {
      if (updateData.currentPosition?.trim()) filledFields++;
      if (updateData.currentCompany?.trim()) filledFields++;
      if (updateData.industry?.trim()) filledFields++;
      if (updateData.graduationYear) filledFields++;
      if (updateData.mentorshipAreas?.length > 0) filledFields++;
    }
    
    const profileStrength = Math.min((filledFields / totalFields) * 100, 100);
    
    const profileData = {
      userId: userId, // CRITICAL: Ensure userId is set
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
      profileData.currentYear = updateData.currentYear;
      profileData.enrollmentYear = updateData.enrollmentYear;
      profileData.department = user.department; // Use department from User model
      profileData.careerGoals = updateData.careerGoals;
      profileData.industryPreferences = updateData.industryPreferences;
      profileData.lookingForMentor = updateData.lookingForMentor;
      
      profile = await Student.findOneAndUpdate(
        { userId },
        { $set: profileData },
        { new: true, upsert: true, runValidators: true }
      );
      
      console.log('Student profile updated:', profile);
      
    } else if (user.role === 'alumni') {
      profileData.currentPosition = updateData.currentPosition;
      profileData.currentCompany = updateData.currentCompany;
      profileData.industry = updateData.industry;
      profileData.graduationYear = updateData.graduationYear;
      profileData.department = user.department; // Use department from User model
      profileData.availableAsMentor = updateData.availableAsMentor;
      profileData.mentorshipAreas = updateData.mentorshipAreas;
      profileData.yearsOfExperience = updateData.yearsOfExperience;
      
      profile = await Alumni.findOneAndUpdate(
        { userId },
        { $set: profileData },
        { new: true, upsert: true, runValidators: true }
      );
      
      console.log('Alumni profile updated:', profile);
    }
    
    // Update User model
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

exports.getAIMentorSuggestions = async (req, res) => {
  try {
    const studentUserId = req.user.id;
    const { limit = 10, minScore = 30 } = req.query; // Lowered minScore to 30

    console.log('=== AI MENTOR SUGGESTIONS ===');
    console.log('Student User ID:', studentUserId);

    const studentProfile = await Student.findOne({ userId: studentUserId });
    console.log('Student Profile Found:', !!studentProfile);
    
    if (!studentProfile) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please complete your student profile first' 
      });
    }

    console.log('Student Skills:', studentProfile.skills);
    console.log('Student Interests:', studentProfile.interests);
    console.log('Student Career Goals:', studentProfile.careerGoals);

    // Find all alumni who are available as mentors
    const alumniProfiles = await Alumni.find({
      availableAsMentor: true,
      userId: { $ne: studentUserId }
    }).populate('userId', 'name email');

    console.log('Found Alumni Profiles:', alumniProfiles.length);
    
    if (alumniProfiles.length === 0) {
      return res.json({
        success: true,
        message: 'No mentors available yet. Please check back later.',
        suggestions: [],
        totalFound: 0
      });
    }

    const matches = alumniProfiles.map(alumniProfile => {
      const { finalScore, breakdown } = AIMatchingEngine.calculateMatchScore(
        studentProfile, 
        alumniProfile
      );
      
      console.log(`Match with ${alumniProfile.fullName}:`, {
        score: finalScore,
        breakdown
      });
      
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
          profileHeadline: alumniProfile.profileHeadline,
          yearsOfExperience: alumniProfile.yearsOfExperience
        },
        matchScore: finalScore,
        matchFactors: breakdown
      };
    });

    const filteredMatches = matches
      .filter(m => m.matchScore >= minScore)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit));

    console.log('Filtered Matches:', filteredMatches.length);

    // Save suggestions to database
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
      message: `Found ${filteredMatches.length} mentor suggestions`,
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

exports.updateMatchingProfile = exports.updateUserProfile;

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