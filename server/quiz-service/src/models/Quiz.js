const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['MCQ', 'Multi-Select', 'True/False', 'Short Answer'], required: true },
  options: [{ type: String }],
  correctAnswer: mongoose.Schema.Types.Mixed, // Array for Multi-Select, string/bool for others
  points: { type: Number, default: 1 }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  isPublished: { type: Boolean, default: false },
  instructorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  questions: [questionSchema],
  startTime: { type: Date },
  endTime: { type: Date },
  duration: { type: Number }, // in minutes
}, { timestamps: true });

// Add compound index for frequent queries
quizSchema.index({ instructorId: 1, isPublished: 1 });
quizSchema.index({ isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
