const express = require('express');
const router = express.Router();
const VerificationRequest = require('../models/VerificationRequest');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');
const emailService = require('../utils/emailService');

// POST /api/verification/request — Alumni submits institution data
router.post('/request', auth, async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can submit verification requests' });
    }

    // Check if already submitted
    const existing = await VerificationRequest.findOne({ alumni: req.user.id, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending verification request' });
    }

    const { institutions } = req.body;
    if (!institutions || institutions.length === 0) {
      return res.status(400).json({ message: 'Please provide at least one institution' });
    }

    const request = await VerificationRequest.create({
      alumni: req.user.id,
      institutions
    });

    // Update user verificationStatus
    await User.findByIdAndUpdate(req.user.id, { verificationStatus: 'pending' });

    res.status(201).json({ message: 'Verification request submitted!', request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/verification/my-status — Alumni checks own status
router.get('/my-status', auth, async (req, res) => {
  try {
    const request = await VerificationRequest.findOne({ alumni: req.user.id })
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name');
    res.json(request || { status: 'not_submitted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/verification/pending — Admin gets pending requests
router.get('/pending', auth, adminOnly, async (req, res) => {
  try {
    const requests = await VerificationRequest.find({ status: 'pending' })
      .populate('alumni', 'name email department graduationYear profileImage')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/verification/all — Admin gets all requests
router.get('/all', auth, adminOnly, async (req, res) => {
  try {
    const requests = await VerificationRequest.find()
      .populate('alumni', 'name email department graduationYear')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/verification/:id/approve — Admin approves
router.put('/:id/approve', auth, adminOnly, async (req, res) => {
  try {
    const request = await VerificationRequest.findById(req.params.id).populate('alumni');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'approved';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.adminNotes = req.body.notes || '';
    await request.save();

    await User.findByIdAndUpdate(request.alumni._id, {
      verificationStatus: 'verified',
      isVerifiedAlumni: true
    });

    await emailService.sendVerificationApprovedEmail(request.alumni);
    res.json({ message: 'Alumni verified successfully', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/verification/:id/reject — Admin rejects
router.put('/:id/reject', auth, adminOnly, async (req, res) => {
  try {
    const request = await VerificationRequest.findById(req.params.id).populate('alumni');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.status = 'rejected';
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.adminNotes = req.body.reason || '';
    await request.save();

    await User.findByIdAndUpdate(request.alumni._id, { verificationStatus: 'rejected' });
    await emailService.sendVerificationRejectedEmail(request.alumni, req.body.reason);
    res.json({ message: 'Request rejected', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
