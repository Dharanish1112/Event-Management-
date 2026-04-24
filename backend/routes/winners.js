const express = require('express');
const router = express.Router();
const Winner = require('../models/Winner');
const Event = require('../models/Event');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/winners
// @desc    Declare winner for an event
// @access  Private (Admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { eventId, studentId, position, prize } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Check if position already taken
    const positionTaken = await Winner.findOne({ event: eventId, position });
    if (positionTaken && position !== 'participant') {
      return res.status(400).json({ success: false, message: `${position} position already declared` });
    }

    const winner = await Winner.create({
      event: eventId,
      student: studentId,
      position,
      prize,
      declaredBy: req.user._id,
    });

    const populated = await winner.populate([
      { path: 'student', select: 'name email college' },
      { path: 'event', select: 'title date college' },
    ]);

    res.status(201).json({ success: true, message: 'Winner declared!', winner: populated });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'This student already has a position in this event' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/winners/event/:eventId
// @desc    Get all winners for an event
// @access  Public
router.get('/event/:eventId', async (req, res) => {
  try {
    const winners = await Winner.find({ event: req.params.eventId })
      .populate('student', 'name email college department')
      .populate('event', 'title date')
      .sort({ position: 1 });

    res.json({ success: true, count: winners.length, winners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/winners/student/:studentId
// @desc    Get all wins for a student
// @access  Private
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const winners = await Winner.find({ student: req.params.studentId })
      .populate('event', 'title date college category')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: winners.length, winners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/winners/:id
// @desc    Remove a winner declaration
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const winner = await Winner.findByIdAndDelete(req.params.id);
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found' });
    }
    res.json({ success: true, message: 'Winner record removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
