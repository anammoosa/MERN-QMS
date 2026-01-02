const express = require('express');
const router = express.Router();
const mammoth = require('mammoth');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/authMiddleware');
const { quizSchema } = require('../validation/quizValidation');
const Quiz = require('../models/Quiz');

// Create Quiz (Wizard) - Instructor only
router.post('/create', protect, authorize('Instructor'), asyncHandler(async (req, res) => {
  const { error, value } = quizSchema.validate(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const quiz = new Quiz(value);
  await quiz.save();

  // Invalidate cache
  if (req.redisClient) {
    await req.redisClient.del('all_quizzes');
    if (req.user) await req.redisClient.del(`instructor_quizzes_${req.user.id}`);
  }

  res.status(201).json(quiz);
}));

// Get all quizzes (Dashboard) - Protected
router.get('/', protect, asyncHandler(async (req, res) => {
  const cacheKey = 'all_quizzes';

  if (req.redisClient) {
    const cachedData = await req.redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
  }

  const quizzes = await Quiz.find({ isPublished: true });

  if (req.redisClient) {
    await req.redisClient.set(cacheKey, JSON.stringify(quizzes), { EX: 60 });
  }

  res.json(quizzes);
}));

// Get Instructor's Quizzes
router.get('/instructor/:instructorId', protect, authorize('Instructor'), asyncHandler(async (req, res) => {
  const cacheKey = `instructor_quizzes_${req.params.instructorId}`;
  // const cachedData = await req.redisClient.get(cacheKey);
  // if (cachedData) return res.json(JSON.parse(cachedData));

  const quizzes = await Quiz.find({ instructorId: req.params.instructorId });
  // await req.redisClient.set(cacheKey, JSON.stringify(quizzes), { EX: 60 });
  res.json(quizzes);
}));

// Delete Quiz - Instructor only
router.delete('/:id', protect, authorize('Instructor'), asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }
  await quiz.deleteOne();

  // Invalidate cache
  if (req.redisClient) {
    await req.redisClient.del('all_quizzes');
    await req.redisClient.del(`quiz_${req.params.id}`);
  }

  res.json({ message: 'Quiz removed' });
}));

// Get Single Quiz (Public/Protected)
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const cacheKey = `quiz_${req.params.id}`;

  if (req.redisClient) {
    const cachedData = await req.redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
  }

  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  if (req.redisClient) {
    await req.redisClient.set(cacheKey, JSON.stringify(quiz), { EX: 300 });
  }

  res.json(quiz);
}));

// Import Quiz from JSON
router.post('/import', protect, authorize('Instructor'), asyncHandler(async (req, res) => {
  const { title, description, questions } = req.body;
  const instructorId = req.user.id;

  const { error, value } = quizSchema.validate({ title, description, instructorId, questions });
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const quiz = new Quiz(value);
  await quiz.save();
  res.status(201).json(quiz);
}));

// Export Quiz Template (for Students) - Public/Protected
router.get('/export/:id', protect, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  // Generate a template without correct answers
  const template = {
    quizId: quiz._id,
    title: quiz.title,
    questions: quiz.questions.map(q => ({
      questionId: q._id,
      text: q.text,
      type: q.type,
      options: q.options,
      points: q.points
    }))
  };

  res.json(template);
}));

// Helper to parse plain text into quiz structure
const parseQuizText = (text) => {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  let title = "Imported Quiz";
  let description = "Automatically imported from Word document.";
  let questions = [];
  let currentQuestion = null;

  lines.forEach(line => {
    if (line.toLowerCase().startsWith('title:')) {
      title = line.split(':')[1].trim();
    } else if (line.toLowerCase().startsWith('question:')) {
      if (currentQuestion) questions.push(currentQuestion);
      currentQuestion = {
        text: line.split(':')[1].trim(),
        type: 'MCQ', // Default to MCQ
        options: [],
        correctAnswer: '',
        points: 1
      };
    } else if (currentQuestion && (line.match(/^[A-D]\)/) || line.match(/^[A-D]\./))) {
      currentQuestion.options.push(line.substring(2).trim());
    } else if (currentQuestion && line.toLowerCase().startsWith('answer:')) {
      const ansChar = line.split(':')[1].trim().toUpperCase();
      const idx = ansChar.charCodeAt(0) - 65; // A=0, B=1, etc
      if (idx >= 0 && idx < currentQuestion.options.length) {
        currentQuestion.correctAnswer = currentQuestion.options[idx];
      }
    }
  });

  if (currentQuestion) questions.push(currentQuestion);

  // Post-parsing check
  questions = questions.map((q, idx) => {
    if (!q.correctAnswer && q.options.length > 0) {
      // Try to find the answer if the user didn't use 'Answer:' but maybe matched an option exactly?
      // No, better to be strict or at least warn.
    }
    return q;
  });

  return { title, description, questions };
};

// Import Quiz from DOCX
router.post('/import-docx', protect, authorize('Instructor'), upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a .docx file');
  }

  const result = await mammoth.extractRawText({ buffer: req.file.buffer });
  const quizData = parseQuizText(result.value);

  const instructorId = req.user.id;
  const { error, value } = quizSchema.validate({ ...quizData, instructorId });

  if (error) {
    res.status(400);
    throw new Error(`Invalid document format: ${error.details[0].message}`);
  }

  const quiz = new Quiz(value);
  await quiz.save();
  res.status(201).json(quiz);
}));

// Export Quiz as Professional DOCX
router.get('/export-docx/:id', protect, asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);
  if (!quiz) {
    res.status(404);
    throw new Error('Quiz not found');
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: quiz.title,
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: quiz.description || "Assessment",
          spacing: { after: 400 },
        }),
        ...quiz.questions.flatMap((q, i) => [
          new Paragraph({
            children: [
              new TextRun({ text: `${i + 1}. ${q.text}`, bold: true }),
            ],
            spacing: { before: 200, after: 100 },
          }),
          ...q.options.map((opt, optIdx) =>
            new Paragraph({
              text: `${String.fromCharCode(65 + optIdx)}) ${opt}`,
              indent: { left: 720 },
            })
          ),
          new Paragraph({ text: "", spacing: { after: 200 } })
        ])
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  res.contentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.attachment(`${quiz.title.replace(/\s+/g, '_')}.docx`);
  res.send(buffer);
}));

module.exports = router;
