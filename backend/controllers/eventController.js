const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');

// Get all events with filtering and pagination
const getAllEvents = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status, 
      search,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'asc'
    } = req.query;
    
    const query = { isActive: true };
    
    // Filter by type
    if (type && type !== 'all') {
      query.type = type;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const events = await Event.find(query)
      .populate('createdBy', 'name email role department')
      .populate('attendees.user', 'name email role department')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error while fetching events' });
  }
};

// Get a single event
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email role department')
      .populate('attendees.user', 'name email role department graduationYear currentCompany');

    if (!event || !event.isActive) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json({ event });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error while fetching event' });
  }
};

// Create a new event (Admin only)
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      title, 
      description, 
      date, 
      time, 
      type, 
      location, 
      maxAttendees, 
      duration, 
      organizer,
      tags,
      imageUrl
    } = req.body;

    const event = new Event({
      title,
      description,
      date,
      time,
      type,
      location,
      maxAttendees,
      duration,
      organizer,
      createdBy: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
      imageUrl
    });

    await event.save();
    await event.populate('createdBy', 'name email role department');

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('newEvent', { event });
    }

    res.status(201).json({
      message: 'Event created successfully',
      event
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error while creating event' });
  }
};

// Update event (Admin only)
const updateEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only admin or event creator can update
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const updates = req.body;
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(tag => tag.trim().toLowerCase());
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role department')
     .populate('attendees.user', 'name email role department');

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('eventUpdated', { event: updatedEvent });
    }

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error while updating event' });
  }
};

// Delete event (Admin only)
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Only admin or event creator can delete
    if (req.user.role !== 'admin' && event.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this event' });
    }

    // Soft delete
    event.isActive = false;
    await event.save();

    res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error while deleting event' });
  }
};

// Register for event (Students and Alumni)
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event || !event.isActive) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event is full
    const currentAttendees = event.attendees.filter(a => a.status === 'registered').length;
    if (currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Check if user is already registered
    if (event.isUserRegistered(req.user.id)) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check if event date has passed
    if (new Date(event.date) < new Date()) {
      return res.status(400).json({ message: 'Cannot register for past events' });
    }

    // Register user
    event.attendees.push({
      user: req.user.id,
      status: 'registered'
    });

    await event.save();
    await event.populate('attendees.user', 'name email role department');

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.emit('eventRegistration', { 
        eventId: event._id, 
        userId: req.user.id,
        currentAttendees: event.currentAttendees
      });
    }

    res.json({
      message: 'Successfully registered for event',
      event
    });

  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: 'Server error while registering for event' });
  }
};

// Unregister from event
const unregisterFromEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event || !event.isActive) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is registered
    const attendeeIndex = event.attendees.findIndex(
      a => a.user.toString() === req.user.id && a.status === 'registered'
    );

    if (attendeeIndex === -1) {
      return res.status(400).json({ message: 'You are not registered for this event' });
    }

    // Remove or update status
    event.attendees[attendeeIndex].status = 'cancelled';
    await event.save();

    res.json({
      message: 'Successfully unregistered from event'
    });

  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({ message: 'Server error while unregistering from event' });
  }
};

// Get events user is registered for
const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({
      'attendees.user': req.user.id,
      'attendees.status': 'registered',
      isActive: true
    })
    .populate('createdBy', 'name email role department')
    .sort({ date: 1 })
    .lean();

    res.json({ events });

  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ message: 'Server error while fetching your events' });
  }
};

// Get event statistics (Admin only)
const getEventStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments({ isActive: true });
    const upcomingEvents = await Event.countDocuments({ 
      isActive: true, 
      status: 'upcoming',
      date: { $gte: new Date() }
    });
    const completedEvents = await Event.countDocuments({ 
      isActive: true, 
      status: 'completed' 
    });

    // Calculate total attendees
    const events = await Event.find({ isActive: true });
    let totalAttendees = 0;
    events.forEach(event => {
      totalAttendees += event.attendees.filter(a => a.status === 'registered').length;
    });

    // Calculate average capacity
    let totalCapacityUsed = 0;
    events.forEach(event => {
      const attendees = event.attendees.filter(a => a.status === 'registered').length;
      totalCapacityUsed += (attendees / event.maxAttendees) * 100;
    });
    const avgCapacity = events.length > 0 ? (totalCapacityUsed / events.length).toFixed(0) : 0;

    res.json({
      stats: {
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalAttendees,
        avgCapacity: `${avgCapacity}%`
      }
    });

  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({ message: 'Server error while fetching event statistics' });
  }
};

module.exports = {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getMyEvents,
  getEventStats
};