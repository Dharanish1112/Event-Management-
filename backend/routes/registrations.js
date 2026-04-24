const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/registrations/:eventId
// @desc    Register student for an event
// @access  Private (Student)
router.post('/:eventId', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check deadline
    if (new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, message: 'Registration deadline has passed' });
    }

    // Check max participants
    if (event.registeredCount >= event.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }

    // Check already registered
    const existing = await Registration.findOne({
      event: req.params.eventId,
      student: req.user._id,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    const registration = await Registration.create({
      event: req.params.eventId,
      student: req.user._id,
    });

    // Increment registered count
    await Event.findByIdAndUpdate(req.params.eventId, { $inc: { registeredCount: 1 } });

    res.status(201).json({ success: true, message: 'Registered successfully!', registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/registrations/my
// @desc    Get current student's registrations
// @access  Private (Student)
router.get('/my', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate('event', 'title date venue category college status')
      .sort({ registeredAt: -1 });

    res.json({ success: true, count: registrations.length, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/registrations/event/:eventId
// @desc    Get all registrations for an event (Admin)
// @access  Private (Admin)
router.get('/event/:eventId', protect, adminOnly, async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('student', 'name email college department year')
      .sort({ registeredAt: -1 });

    res.json({ success: true, count: registrations.length, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/registrations/:id/status
// @desc    Update registration status (mark attended/absent)
// @access  Private (Admin)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('student', 'name email');

    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    res.json({ success: true, message: 'Status updated', registration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/registrations/all-admin
// @desc    Get all registrations for this admin's college events
// @access  Private (Admin)
router.get('/all-admin', protect, adminOnly, async (req, res) => {
  try {
    const Event = require('../models/Event');
    const events = await Event.find({ college: req.user.college }).select('_id');
    const eventIds = events.map(e => e._id);

    const registrations = await Registration.find({ event: { $in: eventIds } })
      .populate('student', 'name email college department year')
      .populate('event', 'title date college')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: registrations.length, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
