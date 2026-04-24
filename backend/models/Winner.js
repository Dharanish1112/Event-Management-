const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    position: {
      type: String,
      enum: ['1st', '2nd', '3rd', 'participant'],
      required: true,
    },
    prize: {
      type: String,
      default: '',
    },
    declaredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// One student can have one position per event
winnerSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Winner', winnerSchema);
