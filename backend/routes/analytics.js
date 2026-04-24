const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Winner = require('../models/Winner');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/analytics/admin
// @desc    Admin dashboard stats
// @access  Private (Admin)
router.get('/admin', protect, adminOnly, async (req, res) => {
  try {
    const college = req.user.college;

    const [
      totalEvents,
      upcomingEvents,
      completedEvents,
      totalStudents,
      totalRegistrations,
      totalWinners,
      recentEvents,
      categoryBreakdown,
    ] = await Promise.all([
      Event.countDocuments({ college }),
      Event.countDocuments({ college, status: 'upcoming' }),
      Event.countDocuments({ college, status: 'completed' }),
      User.countDocuments({ role: 'student' }),
      Registration.countDocuments(),
      Winner.countDocuments(),
      Event.find({ college }).sort({ createdAt: -1 }).limit(5).select('title category status date registeredCount'),
      Event.aggregate([
        { $match: { college } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: {
        totalEvents,
        upcomingEvents,
        completedEvents,
        totalStudents,
        totalRegistrations,
        totalWinners,
      },
      recentEvents,
      categoryBreakdown,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/analytics/student
// @desc    Student dashboard stats
// @access  Private (Student)
router.get('/student', protect, async (req, res) => {
  try {
    const studentId = req.user._id;

    const [
      totalRegistrations,
      attended,
      wins,
      recentRegistrations,
    ] = await Promise.all([
      Registration.countDocuments({ student: studentId }),
      Registration.countDocuments({ student: studentId, status: 'attended' }),
      Winner.countDocuments({ student: studentId, position: { $in: ['1st', '2nd', '3rd'] } }),
      Registration.find({ student: studentId })
        .populate('event', 'title date category college status')
        .sort({ registeredAt: -1 })
        .limit(5),
    ]);

    res.json({
      success: true,
      stats: {
        totalRegistrations,
        attended,
        wins,
        winRate: totalRegistrations > 0 ? Math.round((wins / totalRegistrations) * 100) : 0,
      },
      recentRegistrations,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/analytics/overview
// @desc    Platform-wide overview (public)
// @access  Public
router.get('/overview', async (req, res) => {
  try {
    const [totalEvents, totalStudents, totalColleges, totalWinners] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Event.distinct('college').then((c) => c.length),
      Winner.countDocuments(),
    ]);

    res.json({
      success: true,
      overview: { totalEvents, totalStudents, totalColleges, totalWinners },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
