const express = require('express');
const router = express.Router();
const MeetingRequest = require('../models/MeetingRequest');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');

// Generate a Google Meet-style link (real integration requires OAuth)
const generateMeetLink = () => `https://meet.google.com/${uuidv4().substring(0, 10)}`;

// POST /api/meetings/request — Student requests session
router.post('/request', auth, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can request mentorship' });
    }
    const { alumniId, topic, message, scheduledAt, duration, type } = req.body;

    const alumni = await User.findById(alumniId);
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });

    const meeting = await MeetingRequest.create({
      student: req.user.id,
      alumni: alumniId,
      topic, message, duration, type,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
    });

    const student = await User.findById(req.user.id);
    await emailService.sendMeetingRequestEmail(alumni, student, topic);

    res.status(201).json({ message: 'Meeting request sent!', meeting });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/meetings/my — Get own meetings (student or alumni)
router.get('/my', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'student'
      ? { student: req.user.id }
      : { alumni: req.user.id };

    const meetings = await MeetingRequest.find(filter)
      .populate('student', 'name email profileImage department currentYear')
      .populate('alumni', 'name email profileImage currentPosition currentCompany')
      .sort({ createdAt: -1 });
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/meetings/:id/accept — Alumni accepts and schedules
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const meeting = await MeetingRequest.findById(req.params.id)
      .populate('student alumni');
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.alumni._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    meeting.status = 'accepted';
    meeting.meetingLink = generateMeetLink();
    if (req.body.scheduledAt) meeting.scheduledAt = new Date(req.body.scheduledAt);
    await meeting.save();

    await emailService.sendMeetingAcceptedEmail(
      meeting.student, meeting.alumni,
      meeting.meetingLink, meeting.scheduledAt
    );

    // Schedule reminder 10 min before meeting
    if (meeting.scheduledAt) {
      const reminderTime = new Date(meeting.scheduledAt.getTime() - 10 * 60 * 1000);
      const now = new Date();
      if (reminderTime > now) {
        const delay = reminderTime - now;
        setTimeout(async () => {
          try {
            await emailService.sendReminderEmail(meeting.student, meeting.meetingLink, meeting.scheduledAt);
            await emailService.sendReminderEmail(meeting.alumni, meeting.meetingLink, meeting.scheduledAt);
          } catch (e) { console.error('Reminder error', e); }
        }, delay);
      }
    }

    res.json({ message: 'Meeting accepted!', meeting });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/meetings/:id/reject — Alumni rejects
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const meeting = await MeetingRequest.findById(req.params.id);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.alumni.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    meeting.status = 'rejected';
    meeting.rejectionReason = req.body.reason || '';
    await meeting.save();
    res.json({ message: 'Meeting rejected', meeting });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/meetings/:id/complete — Mark as completed
router.put('/:id/complete', auth, async (req, res) => {
  try {
    const meeting = await MeetingRequest.findByIdAndUpdate(
      req.params.id, { status: 'completed' }, { new: true }
    );
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/meetings/workshop — Multiple students request workshop
router.post('/workshop', auth, async (req, res) => {
  try {
    const { alumniId, topic, message, scheduledAt, maxParticipants } = req.body;
    const alumni = await User.findById(alumniId);
    if (!alumni) return res.status(404).json({ message: 'Alumni not found' });

    const workshop = await MeetingRequest.create({
      student: req.user.id,
      alumni: alumniId,
      type: 'workshop',
      topic, message, scheduledAt,
      maxParticipants: maxParticipants || 20,
      participants: [req.user.id]
    });

    const student = await User.findById(req.user.id);
    await emailService.sendMeetingRequestEmail(alumni, student, `[WORKSHOP] ${topic}`);
    res.status(201).json({ message: 'Workshop request sent!', workshop });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
