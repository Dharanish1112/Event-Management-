const express = require('express');
const router = express.Router();
const Winner = require('../models/Winner');
const Registration = require('../models/Registration');
const { protect } = require('../middleware/auth');

// @route   GET /api/certificates/my
// @desc    Get all certificates for logged-in student
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    // Participation certificates (attended events)
    const participations = await Registration.find({
      student: req.user._id,
      status: 'attended',
    }).populate('event', 'title date college category');

    // Winner certificates
    const wins = await Winner.find({ student: req.user._id })
      .populate('event', 'title date college category')
      .populate('student', 'name college department');

    const certificates = [
      ...participations.map((r) => ({
        type: 'participation',
        event: r.event,
        issuedAt: r.updatedAt,
      })),
      ...wins.map((w) => ({
        type: 'winner',
        position: w.position,
        prize: w.prize,
        event: w.event,
        student: w.student,
        issuedAt: w.createdAt,
      })),
    ];

    res.json({ success: true, count: certificates.length, certificates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/certificates/:winnerId
// @desc    Get certificate data for a specific winner record
// @access  Private
router.get('/:winnerId', protect, async (req, res) => {
  try {
    const winner = await Winner.findById(req.params.winnerId)
      .populate('student', 'name email college department year')
      .populate('event', 'title date college category venue');

    if (!winner) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    // Only the student or admin can view
    if (
      winner.student._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, certificate: winner });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
