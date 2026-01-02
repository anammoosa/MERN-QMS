const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedOptions: mongoose.Schema.Types.Mixed, // Array or string
  }],
  score: { type: Number, default: 0 },
  status: { type: String, enum: ['Draft', 'Submitted'], default: 'Draft' },
  submittedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
