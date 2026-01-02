const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const csv = require('csv-parser');
const stream = require('stream');
const asyncHandler = require('express-async-handler');
const { protect, authorize } = require('../middleware/authMiddleware');
const Quiz = require('../models/Quiz');
const { quizSchema } = require('../validation/quizValidation');

// Helper to parse CSV buffer
const parseCSV = (buffer) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        bufferStream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

router.post('/import-csv', protect, authorize('Instructor'), upload.single('file'), asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a .csv file');
    }

    const results = await parseCSV(req.file.buffer);

    // Transform CSV data to Question Model
    // Expected CSV Headers: Question, Type, OptionA, OptionB, OptionC, OptionD, Answer, Points
    const questions = results.map(row => {
        const options = [];
        if (row['OptionA']) options.push(row['OptionA']);
        if (row['OptionB']) options.push(row['OptionB']);
        if (row['OptionC']) options.push(row['OptionC']);
        if (row['OptionD']) options.push(row['OptionD']);

        return {
            text: row['Question'],
            type: row['Type'] || 'MCQ',
            options: options.length > 0 ? options : undefined,
            correctAnswer: row['Answer'],
            points: Number(row['Points']) || 1
        };
    });

    // Create minimal valid quiz structure (User will refine title/desc later or pass in body)
    const quizData = {
        title: req.body.title || 'Imported CSV Quiz',
        description: req.body.description || 'Imported from CSV',
        instructorId: req.user.id,
        questions
    };

    const quiz = new Quiz(quizData);
    await quiz.save();

    if (req.redisClient) {
        await req.redisClient.del('all_quizzes');
        await req.redisClient.del(`instructor_quizzes_${req.user.id}`);
    }

    res.status(201).json(quiz);
}));

module.exports = router;
