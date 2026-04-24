const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      enum: ['technical', 'cultural', 'sports', 'academic', 'workshop', 'other'],
      required: true,
    },
    college: {
      type: String,
      required: [true, 'College name is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      trim: true,
    },
    maxParticipants: {
      type: Number,
      default: 100,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    banner: {
      type: String,
      default: '',
    },
    prizes: {
      first: { type: String, default: '' },
      second: { type: String, default: '' },
      third: { type: String, default: '' },
    },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
