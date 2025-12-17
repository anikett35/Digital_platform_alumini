const User = require('../models/User');

const getAlumniProfiles = async (req, res) => {
  try {
    console.log('Fetching alumni profiles with filters:', req.query);
    
    const { 
      industry, 
      company, 
      department,
      graduationYear,
      search, 
      page = 1, 
      limit = 12 
    } = req.query;
    
    // Core filter: Must be an alumni and active
    let filter = { 
      role: 'alumni', 
      isActive: true
    };
    
    // Apply filters safely
    if (industry && industry !== 'undefined') filter.industry = new RegExp(industry, 'i');
    if (company && company !== 'undefined') filter.currentCompany = new RegExp(company, 'i');
    if (department && department !== 'undefined') filter.department = new RegExp(department, 'i');
    if (graduationYear && graduationYear !== 'undefined') filter.graduationYear = parseInt(graduationYear);
    
    // Multi-field search logic
    if (search && search !== 'undefined') {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { profileHeadline: searchRegex },
        { currentCompany: searchRegex },
        { currentPosition: searchRegex }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const alumni = await User.find(filter)
      .select('name email profileHeadline currentCompany currentPosition industry profileImage department graduationYear')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      alumni,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalAlumni: total
    });
  } catch (error) {
    console.error('Error getting alumni profiles:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAlumniProfile = async (req, res) => {
  try {
    const alumni = await User.findById(req.params.id).select('-password').lean();
    if (!alumni || alumni.role !== 'alumni') {
      return res.status(404).json({ success: false, message: 'Alumni not found' });
    }
    res.json({ success: true, alumni });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getSimilarAlumni = async (req, res) => {
  try {
    const alumni = await User.findById(req.params.id).select('department skills industry').lean();
    if (!alumni) return res.status(404).json({ success: false, message: 'Not found' });

    const similarAlumni = await User.find({
      _id: { $ne: req.params.id },
      role: 'alumni',
      isActive: true,
      $or: [
        { department: alumni.department },
        { industry: alumni.industry }
      ]
    }).limit(6).lean();
    
    res.json({ success: true, similarAlumni });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export functions as an object
module.exports = { getAlumniProfiles, getAlumniProfile, getSimilarAlumni };