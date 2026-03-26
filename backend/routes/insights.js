const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// GET /api/insights/department/:dept — AI-style career analysis
router.get('/department/:dept', auth, async (req, res) => {
  try {
    const dept = req.params.dept;
    const alumni = await User.find({
      role: 'alumni', department: { $regex: dept, $options: 'i' }
    }).select('skills currentPosition currentCompany industry workExperience');

    const skillCount = {};
    const companyCount = {};
    const positionCount = {};

    alumni.forEach(a => {
      (a.skills || []).forEach(s => { skillCount[s] = (skillCount[s] || 0) + 1; });
      if (a.currentCompany) companyCount[a.currentCompany] = (companyCount[a.currentCompany] || 0) + 1;
      if (a.currentPosition) positionCount[a.currentPosition] = (positionCount[a.currentPosition] || 0) + 1;
    });

    const topSkills = Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([skill, count]) => ({ skill, count }));
    const topCompanies = Object.entries(companyCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([company, count]) => ({ company, count }));
    const topRoles = Object.entries(positionCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([role, count]) => ({ role, count }));

    res.json({ department: dept, totalAlumni: alumni.length, topSkills, topCompanies, topRoles });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/insights/alumni?department=CS&specialization=Cybersecurity&company=Google
router.get('/alumni', auth, async (req, res) => {
  try {
    const { department, specialization, company, gradYear } = req.query;
    const filter = { role: 'alumni', isActive: true };

    if (department) filter.department = { $regex: department, $options: 'i' };
    if (company) filter.currentCompany = { $regex: company, $options: 'i' };
    if (gradYear) filter.graduationYear = parseInt(gradYear);
    if (specialization) {
      filter.$or = [
        { skills: { $regex: specialization, $options: 'i' } },
        { currentPosition: { $regex: specialization, $options: 'i' } },
        { industry: { $regex: specialization, $options: 'i' } }
      ];
    }

    const alumni = await User.find(filter)
      .select('name department graduationYear currentPosition currentCompany industry skills profileImage bio isOpenToMentorship')
      .limit(50);

    res.json(alumni);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
