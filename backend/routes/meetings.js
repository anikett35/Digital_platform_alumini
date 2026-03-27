const express = require('express');
const router = express.Router();
const MeetingRequest = require('../models/MeetingRequest');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const { v4: uuidv4 } = require('uuid');

const generateMeetLink = () => `https://meet.google.com/${uuidv4().substring(0, 10)}`;

// ─── POST /api/meetings/request — Student requests meeting ──────────────────
router.post('/request', auth, checkRole('student'), async (req, res) => {
  try {
    const { alumniId, topic, message, scheduledAt, duration, type } = req.body;

    if (!alumniId || !topic) {
      return res.status(400).json({ message: 'Alumni ID and topic are required' });
    }
    if (topic.trim().length < 5) {
      return res.status(400).json({ message: 'Topic must be at least 5 characters' });
    }

    // Validate date if provided
    if (scheduledAt) {
      const d = new Date(scheduledAt);
      if (isNaN(d.getTime()) || d <= new Date()) {
        return res.status(400).json({ message: 'Scheduled date must be in the future' });
      }
    }

    const alumni = await User.findOne({ _id: alumniId, role: 'alumni', approvalStatus: 'approved' });
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });

    // Prevent duplicate pending requests
    const existing = await MeetingRequest.findOne({ student: req.user.id, alumni: alumniId, status: 'pending' });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request with this alumni' });
    }

    const meeting = await MeetingRequest.create({
      student: req.user.id,
      alumni: alumniId,
      topic: topic.trim(),
      message: message ? message.trim() : '',
      duration: duration || 30,
      type: type || 'one-on-one',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
    });

    // Email notification (non-blocking)
    try {
      const student = await User.findById(req.user.id);
      await emailService.sendMeetingRequestEmail(alumni, student, topic);
    } catch (e) { console.error('Email error (non-fatal):', e.message); }

    const populated = await MeetingRequest.findById(meeting._id)
      .populate('student', 'name email department currentYear')
      .populate('alumni', 'name email currentPosition currentCompany');

    res.status(201).json({ message: 'Meeting request sent!', meeting: populated });
  } catch (err) {
    console.error('Request meeting error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── GET /api/meetings/my — Get my meetings ──────────────────────────────────
router.get('/my', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = req.user.role === 'student'
      ? { student: req.user.id }
      : req.user.role === 'alumni'
        ? { alumni: req.user.id }
        : {}; // admin sees all

    if (status && ['pending','accepted','rejected','completed','cancelled'].includes(status)) {
      filter.status = status;
    }

    const meetings = await MeetingRequest.find(filter)
      .populate('student', 'name email profileImage department currentYear')
      .populate('alumni', 'name email profileImage currentPosition currentCompany')
      .sort({ createdAt: -1 });

    res.json(meetings);
  } catch (err) {
    console.error('Get meetings error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PUT /api/meetings/:id/accept — Alumni accepts ───────────────────────────
router.put('/:id/accept', auth, checkRole('alumni'), async (req, res) => {
  try {
    const meeting = await MeetingRequest.findById(req.params.id).populate('student alumni');
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.alumni._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (meeting.status !== 'pending') {
      return res.status(400).json({ message: `Cannot accept a meeting that is already ${meeting.status}` });
    }

    const { scheduledAt, meetingLink, note } = req.body;

    // Validate meeting link if provided
    if (meetingLink) {
      try { new URL(meetingLink); } catch {
        return res.status(400).json({ message: 'Meeting link must be a valid URL' });
      }
    }
    // Validate date if provided
    if (scheduledAt) {
      const d = new Date(scheduledAt);
      if (isNaN(d.getTime()) || d <= new Date()) {
        return res.status(400).json({ message: 'Scheduled date must be in the future' });
      }
      meeting.scheduledAt = d;
    }

    meeting.status = 'accepted';
    meeting.meetingLink = meetingLink || generateMeetLink();
    meeting.rejectionReason = note || '';
    await meeting.save();

    // Email notification (non-blocking)
    try {
      await emailService.sendMeetingAcceptedEmail(
        meeting.student, meeting.alumni, meeting.meetingLink, meeting.scheduledAt
      );
      // Schedule reminder
      if (meeting.scheduledAt) {
        const reminderTime = new Date(meeting.scheduledAt.getTime() - 10 * 60 * 1000);
        const delay = reminderTime - new Date();
        if (delay > 0) {
          setTimeout(async () => {
            try {
              await emailService.sendReminderEmail(meeting.student, meeting.meetingLink, meeting.scheduledAt);
              await emailService.sendReminderEmail(meeting.alumni, meeting.meetingLink, meeting.scheduledAt);
            } catch (e) { console.error('Reminder error:', e); }
          }, delay);
        }
      }
    } catch (e) { console.error('Email error (non-fatal):', e.message); }

    res.json({ message: 'Meeting accepted!', meeting });
  } catch (err) {
    console.error('Accept meeting error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── PUT /api/meetings/:id/reject — Alumni rejects ───────────────────────────
router.put('/:id/reject', auth, checkRole('alumni'), async (req, res) => {
  try {
    const meeting = await MeetingRequest.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.alumni.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (meeting.status !== 'pending') {
      return res.status(400).json({ message: `Cannot reject a meeting that is already ${meeting.status}` });
    }

    meeting.status = 'rejected';
    meeting.rejectionReason = req.body.reason || '';
    await meeting.save();

    res.json({ message: 'Meeting rejected', meeting });
  } catch (err) {
    console.error('Reject meeting error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PUT /api/meetings/:id/cancel — Student or alumni cancels ────────────────
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const meeting = await MeetingRequest.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    const isStudent = meeting.student.toString() === req.user.id;
    const isAlumni = meeting.alumni.toString() === req.user.id;
    if (!isStudent && !isAlumni && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (['completed', 'cancelled'].includes(meeting.status)) {
      return res.status(400).json({ message: `Meeting is already ${meeting.status}` });
    }

    meeting.status = 'cancelled';
    meeting.rejectionReason = req.body.reason || '';
    await meeting.save();

    res.json({ message: 'Meeting cancelled', meeting });
  } catch (err) {
    console.error('Cancel meeting error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── PUT /api/meetings/:id/complete — Mark as completed ──────────────────────
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const meeting = await MeetingRequest.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    const isAlumni = meeting.alumni.toString() === req.user.id;
    if (!isAlumni && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only the alumni or admin can mark as completed' });
    }
    if (meeting.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted meetings can be marked as completed' });
    }

    meeting.status = 'completed';
    await meeting.save();

    // Award reward points to alumni
    await User.findByIdAndUpdate(meeting.alumni, { $inc: { rewardPoints: 10 } });

    res.json({ message: 'Meeting marked as completed!', meeting });
  } catch (err) {
    console.error('Complete meeting error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Workshop route (unchanged) ───────────────────────────────────────────────
router.post('/workshop', auth, checkRole('student'), async (req, res) => {
  try {
    const { alumniId, topic, message, scheduledAt, maxParticipants } = req.body;
    const alumni = await User.findById(alumniId);
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });

    const workshop = await MeetingRequest.create({
      student: req.user.id, alumni: alumniId,
      type: 'workshop', topic, message, scheduledAt,
      maxParticipants: maxParticipants || 20,
      participants: [req.user.id],
    });

    const student = await User.findById(req.user.id);
    try { await emailService.sendMeetingRequestEmail(alumni, student, `[WORKSHOP] ${topic}`); }
    catch (e) { console.error('Email error (non-fatal):', e.message); }

    res.status(201).json({ message: 'Workshop request sent!', workshop });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
