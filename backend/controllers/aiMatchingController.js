const User = require('../models/User');
const MentorshipMatch = require('../models/MentorshipMatch');

// AI Matching Engine (utility class, not exported directly)
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

  static calculateMatchScore(student, mentor) {
    const weights = {
      skills: 0.30,
      interests: 0.25,
      industry: 0.20,
      careerGoals: 0.15,
      department: 0.10
    };

    const skillsMatch = this.calculateArraySimilarity(student.skills || [], mentor.skills || []);
    const interestsMatch = this.calculateArraySimilarity(student.interests || [], mentor.interests || []);
    const industryMatch = this.calculateArraySimilarity(student.industryPreferences || [], [mentor.currentCompany, mentor.industry].filter(Boolean));
    const careerGoalsMatch = this.calculateTextSimilarity((student.careerGoals || []).join(' '), (mentor.mentorshipAreas || []).join(' '));
    const departmentMatch = (student.department === mentor.department) ? 100 : 0;

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

// ==================== CONTROLLER FUNCTIONS ====================

// Get user profile for AI matching
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update user profile for AI matching
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    
    console.log('Updating profile for user:', userId);
    console.log('Update data:', updateData);
    
    // Calculate profile strength
    let filledFields = 0;
    const totalFields = 12;
    
    if (updateData.bio && updateData.bio.trim()) filledFields++;
    if (updateData.skills && updateData.skills.length > 0) filledFields++;
    if (updateData.interests && updateData.interests.length > 0) filledFields++;
    if (updateData.careerGoals && updateData.careerGoals.length > 0) filledFields++;
    if (updateData.industryPreferences && updateData.industryPreferences.length > 0) filledFields++;
    if (updateData.currentPosition && updateData.currentPosition.trim()) filledFields++;
    if (updateData.yearsOfExperience && updateData.yearsOfExperience > 0) filledFields++;
    if (updateData.location && updateData.location.trim()) filledFields++;
    if (updateData.currentCompany && updateData.currentCompany.trim()) filledFields++;
    if (updateData.education && updateData.education.length > 0) filledFields++;
    if (updateData.profileHeadline && updateData.profileHeadline.trim()) filledFields++;
    if (updateData.industry && updateData.industry.trim()) filledFields++;
    
    const profileStrength = Math.min((filledFields / totalFields) * 100, 100);
    
    // Prepare update object - map frontend fields to backend model
    const updateObject = {
      // Basic info
      bio: updateData.bio,
      currentPosition: updateData.currentRole || updateData.currentPosition,
      location: updateData.location,
      currentCompany: updateData.currentCompany,
      profileHeadline: updateData.profileHeadline || updateData.bio?.substring(0, 200),
      industry: updateData.industry,
      
      // Arrays
      skills: updateData.skills,
      interests: updateData.interests,
      careerGoals: updateData.careerGoals,
      industryPreferences: updateData.industryPreferences,
      education: updateData.education,
      mentorshipAreas: updateData.mentorshipAreas,
      
      // URLs
      linkedinUrl: updateData.linkedinUrl,
      githubUrl: updateData.githubUrl,
      
      // Mentorship preferences
      lookingForMentor: updateData.lookingForMentor,
      availableAsMentor: updateData.availableAsMentor,
      
      // Calculated fields
      profileStrength,
      profileComplete: profileStrength >= 70,
      lastProfileUpdate: new Date()
    };
    
    // Remove undefined fields
    Object.keys(updateObject).forEach(key => {
      if (updateObject[key] === undefined) {
        delete updateObject[key];
      }
    });
    
    console.log('Update object to save:', updateObject);
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateObject },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log('Profile updated successfully:', updatedUser.email);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
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

// Get profile completion status
exports.getProfileStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select('profileComplete profileStrength');
    
    res.status(200).json({
      success: true,
      profileComplete: user?.profileComplete || false,
      profileStrength: user?.profileStrength || 0
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get AI-powered mentor suggestions
exports.getAIMentorSuggestions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { limit = 10, minScore = 40 } = req.query;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') return res.status(400).json({ message: 'Invalid student profile' });

    const mentors = await User.find({
      role: 'alumni',
      availableAsMentor: true,
      _id: { $ne: studentId }
    }).select('name email department graduationYear currentCompany currentPosition skills interests mentorshipAreas industry bio');

    const matches = mentors.map(mentor => {
      const { finalScore, breakdown } = AIMatchingEngine.calculateMatchScore(student, mentor);
      return { mentor: mentor.toObject(), matchScore: finalScore, matchFactors: breakdown };
    });

    const filteredMatches = matches
      .filter(m => m.matchScore >= minScore)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, parseInt(limit));

    // Save suggested matches
    await Promise.all(filteredMatches.map(async match => {
      const existing = await MentorshipMatch.findOne({ student: studentId, mentor: match.mentor._id });
      if (!existing) {
        return MentorshipMatch.create({ student: studentId, mentor: match.mentor._id, matchScore: match.matchScore, matchFactors: match.matchFactors, status: 'suggested' });
      }
      return existing;
    }));

    res.json({ message: 'AI mentor suggestions generated successfully', suggestions: filteredMatches, totalFound: filteredMatches.length });

  } catch (error) {
    console.error('AI matching error:', error);
    res.status(500).json({ message: 'Error generating mentor suggestions' });
  }
};

// Send mentorship request (student)
exports.sendMentorshipRequest = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { mentorId, message, topic } = req.body;

    let match = await MentorshipMatch.findOne({ student: studentId, mentor: mentorId });

    if (!match) {
      const student = await User.findById(studentId);
      const mentor = await User.findById(mentorId);
      const { finalScore, breakdown } = AIMatchingEngine.calculateMatchScore(student, mentor);

      match = new MentorshipMatch({ student: studentId, mentor: mentorId, matchScore: finalScore, matchFactors: breakdown });
    }

    match.status = 'pending';
    match.requestMessage = message;
    match.mentorshipTopic = topic;
    match.requestedAt = new Date();
    await match.save();
    await match.populate('mentor', 'name email currentCompany currentPosition');

    res.json({ message: 'Mentorship request sent successfully', match });

  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ message: 'Error sending mentorship request' });
  }
};

// Respond to mentorship request (mentor)
exports.respondToMentorshipRequest = async (req, res) => {
  try {
    const mentorId = req.user.id;
    const { matchId, status, responseMessage } = req.body;

    const match = await MentorshipMatch.findOne({ _id: matchId, mentor: mentorId, status: 'pending' });
    if (!match) return res.status(404).json({ message: 'Mentorship request not found' });

    match.status = status;
    match.responseMessage = responseMessage;
    match.respondedAt = new Date();
    if (status === 'accepted') match.startDate = new Date();

    await match.save();
    await match.populate('student', 'name email department');

    res.json({ message: `Mentorship request ${status}`, match });

  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ message: 'Error responding to request' });
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
      .populate('student', 'name email department currentYear')
      .populate('mentor', 'name email currentCompany currentPosition')
      .sort({ createdAt: -1 });

    const grouped = {
      suggested: matches.filter(m => m.status === 'suggested'),
      pending: matches.filter(m => m.status === 'pending'),
      accepted: matches.filter(m => m.status === 'accepted'),
      rejected: matches.filter(m => m.status === 'rejected'),
      completed: matches.filter(m => m.status === 'completed')
    };

    res.json({ matches: grouped, total: matches.length });

  } catch (error) {
    console.error('Get mentorship status error:', error);
    res.status(500).json({ message: 'Error fetching mentorship status' });
  }
};

// Update matching profile (now using the specific function above)
exports.updateMatchingProfile = exports.updateUserProfile;

// Get matching analytics (admin)
exports.getMatchingAnalytics = async (req, res) => {
  try {
    const totalMatches = await MentorshipMatch.countDocuments();
    const acceptedMatches = await MentorshipMatch.countDocuments({ status: 'accepted' });
    const pendingRequests = await MentorshipMatch.countDocuments({ status: 'pending' });

    const avgMatchScore = await MentorshipMatch.aggregate([{ $group: { _id: null, avgScore: { $avg: '$matchScore' } } }]);

    const topMatches = await MentorshipMatch.find({ status: 'accepted' })
      .sort({ matchScore: -1 })
      .limit(10)
      .populate('student', 'name')
      .populate('mentor', 'name');

    res.json({
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
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};