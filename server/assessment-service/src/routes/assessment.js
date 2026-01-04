const express = require('express');
const router = express.Router();
const axios = require('axios');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { submissionSchema } = require('../validation/assessmentValidation');
const Submission = require('../models/Submission');

const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || 'http://localhost:5002/api/quizzes';

// Grading Logic with Partial Credit
const calculateScore = (quizQuestions, userAnswers) => {
  let totalScore = 0;

  quizQuestions.forEach(q => {
    const userAnswer = userAnswers.find(ua => ua.questionId.toString() === q._id.toString());
    if (!userAnswer) return;

    if (q.type === 'MCQ' || q.type === 'True/False') {
      if (userAnswer.selectedOptions === q.correctAnswer) {
        totalScore += q.points;
      }
    } else if (q.type === 'Multi-Select') {
      const correctAnswers = q.correctAnswer;
      const userSelected = userAnswer.selectedOptions;

      if (Array.isArray(correctAnswers) && Array.isArray(userSelected)) {
        const matched = userSelected.filter(opt => correctAnswers.includes(opt)).length;
        const incorrect = userSelected.filter(opt => !correctAnswers.includes(opt)).length;

        // Partial credit: (matched - incorrect) / totalCorrect * points, capped at 0
        let partial = ((matched - incorrect) / correctAnswers.length) * q.points;
        totalScore += Math.max(0, partial);
      }
    }
  });

  return totalScore;
};

const Queue = require('bull');
const gradingQueue = new Queue('grading', process.env.REDIS_URL || 'redis://localhost:6379');

router.post('/submit', protect, asyncHandler(async (req, res) => {
  const { error, value } = submissionSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { quizId, answers } = value;
  const userId = req.user.id;

  // Create initial submission with 'Processing' status
  const submission = new Submission({
    userId,
    quizId,
    answers,
    score: 0, // Placeholder
    status: 'Processing',
    submittedAt: new Date()
  });

  await submission.save();

  // Add to Queue
  gradingQueue.add({
    submissionId: submission._id,
    quizId,
    answers
  });

  res.status(201).json({ message: 'Submission received, grading in progress.', submissionId: submission._id });
}));

// Save Draft
router.post('/save-draft', protect, asyncHandler(async (req, res) => {
  const { quizId, answers } = req.body;
  const userId = req.user.id;

  let submission = await Submission.findOne({ userId, quizId, status: 'Draft' });

  if (submission) {
    submission.answers = answers;
    await submission.save();
  } else {
    submission = new Submission({ userId, quizId, answers, status: 'Draft' });
    await submission.save();
  }
  res.json({ message: 'Draft saved', submission });
}));
// Get Student Stats
router.get('/stats/student/:userId', protect, asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ userId: req.params.userId, status: 'Submitted' });
  const completedCount = submissions.length;
  const certificatesCount = submissions.filter(s => s.score >= 70).length;

  res.json({
    completedCount,
    certificatesCount
  });
}));

// Get recent valid submissions for a student
router.get('/history/student/:userId', protect, asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.userId && req.user.role !== 'Admin') {
    res.status(401);
    throw new Error('Not authorized');
  }

  const submissions = await Submission.find({
    userId: req.params.userId,
    status: { $in: ['Submitted', 'Completed', 'Processing'] }
  })
    .sort({ submittedAt: -1 })
    .limit(5);

  res.json(submissions);
}));

// Get Instructor Stats
router.post('/stats/instructor', protect, asyncHandler(async (req, res) => {
  const { quizIds } = req.body;
  const submissions = await Submission.find({ quizId: { $in: quizIds }, status: 'Submitted' });

  const activeStudents = new Set(submissions.map(s => s.userId.toString())).size;
  const avgScore = submissions.length > 0
    ? submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length
    : 0;

  res.json({
    activeStudents,
    avgScore: Math.round(avgScore)
  });
}));

// Upload Offline Submission
router.post('/upload-submission', protect, asyncHandler(async (req, res) => {
  const { quizId, answers } = req.body;
  const userId = req.user.id;

  if (!quizId || !answers) {
    res.status(400);
    throw new Error('Invalid submission file');
  }

  // Fetch quiz questions from Quiz Service
  const response = await axios.get(`${QUIZ_SERVICE_URL}`);
  const quizzes = response.data;
  const quiz = quizzes.find(q => q._id.toString() === quizId);

  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const score = calculateScore(quiz.questions, answers);

  const submission = new Submission({
    userId,
    quizId,
    answers,
    score,
    status: 'Submitted',
    submittedAt: new Date()
  });

  await submission.save();
  res.status(201).json({ score, submissionId: submission._id });
}));

module.exports = router;
