const express = require('express');
const router = express.Router();
const axios = require('axios');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { submissionSchema } = require('../validation/assessmentValidation');
const Submission = require('../models/Submission');

const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || 'http://localhost:5002/api/quizzes';

const calculateScore = (quizQuestions, userAnswers) => {
  let totalScore = 0;

  quizQuestions.forEach(q => {
    const userAnswer = userAnswers.find(ua => ua.questionId.toString() === q._id.toString());
    if (!userAnswer) return;

    const userSelected = userAnswer.selectedOptions;

    if (q.type === 'MCQ' || q.type === 'True/False') {
      // Comparison: String vs String
      if (typeof userSelected === 'string' && typeof q.correctAnswer === 'string') {
        if (userSelected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
          totalScore += (q.points || 1);
        }
      }
    } else if (q.type === 'Short Answer') {
      // Simple case-insensitive match for MVP
      if (typeof userSelected === 'string' && typeof q.correctAnswer === 'string') {
        if (userSelected.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
          totalScore += (q.points || 1);
        }
      }
    } else if (q.type === 'Multi-Select') {
      const correctAnswers = q.correctAnswer;

      if (Array.isArray(correctAnswers) && Array.isArray(userSelected)) {
        const correctSet = new Set(correctAnswers.map(a => a.trim().toLowerCase()));
        const userSet = new Set(userSelected.map(a => a.trim().toLowerCase()));

        let matched = 0;
        userSet.forEach(ans => {
          if (correctSet.has(ans)) matched++;
        });

        const incorrect = userSet.size - matched;

        // Partial credit logic
        let partial = ((matched - incorrect) / correctSet.size) * (q.points || 1);
        totalScore += Math.max(0, partial);
      }
    }
  });

  return Math.round(totalScore * 10) / 10; // Round to 1 decimal
};

// ... Queue definition (ignored) ...

router.post('/submit', protect, asyncHandler(async (req, res) => {
  const { error, value } = submissionSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { quizId, answers } = value;
  const userId = req.user.id;

  // Fetch quiz FIRST to calculate score immediately (Synchronous Grading)
  try {
    const quizResponse = await axios.get(`${QUIZ_SERVICE_URL}/${quizId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    const quiz = quizResponse.data;

    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const score = calculateScore(quiz.questions, answers);

    const submission = new Submission({
      userId,
      quizId,
      answers,
      score,
      status: 'Submitted', // Directly Submitted
      submittedAt: new Date()
    });

    await submission.save();

    res.status(201).json({
      message: 'Assessment completed successfully.',
      submissionId: submission._id,
      score
    });

  } catch (err) {
    console.error('Submission processing failed:', err.message);
    res.status(500);
    throw new Error('Failed to process submission.');
  }
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
  if (req.user.id.toString() !== req.params.userId && req.user.role !== 'Admin') {
    res.status(401);
    throw new Error('Not authorized');
  }

  const submissions = await Submission.find({
    userId: req.params.userId,
    status: { $in: ['Submitted', 'Completed', 'Processing'] }
  })
    .sort({ submittedAt: -1 })
    .limit(5);

  // Fetch quiz titles to enrich submissions (single batch call)
  try {
    const quizIds = submissions.map(s => s.quizId.toString());
    if (quizIds.length > 0) {
      const quizResponse = await axios.get(`${QUIZ_SERVICE_URL}`);
      const quizzes = Array.isArray(quizResponse.data) ? quizResponse.data : [];
      const quizMap = new Map(quizzes.map(q => [q._id.toString(), q.title]));

      const enrichedSubmissions = submissions.map(submission => ({
        ...submission.toObject(),
        quizTitle: quizMap.get(submission.quizId.toString()) || 'Unknown Assessment'
      }));

      return res.json(enrichedSubmissions);
    }
  } catch (error) {
    console.error('Error fetching quiz titles:', error);
    // If quiz service fails, return submissions without titles
  }

  res.json(submissions.map(s => ({
    ...s.toObject(),
    quizTitle: 'Unknown Assessment'
  })));
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
  const response = await axios.get(`${QUIZ_SERVICE_URL}`, {
    headers: { Authorization: req.headers.authorization }
  });
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
