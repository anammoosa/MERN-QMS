const Queue = require('bull');
const mongoose = require('mongoose');
const Submission = require('../models/Submission');
const axios = require('axios');

// Redis Queue
const gradingQueue = new Queue('grading', process.env.REDIS_URL || 'redis://localhost:6379');
const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || 'http://localhost:5002/api/quizzes';

// Score Calculation Logic (Reused)
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
        } else if (q.type === 'Short Answer') {
            if (typeof userAnswer.selectedOptions === 'string' &&
                userAnswer.selectedOptions.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
                totalScore += q.points;
            }
        }
    });

    return totalScore;
};

// Process Job
gradingQueue.process(async (job) => {
    const { submissionId, quizId, answers } = job.data;
    console.log(`Processing submission ${submissionId} for quiz ${quizId}`);

    try {
        // Fetch Quiz (Optimized: Get specific quiz)
        const response = await axios.get(`${QUIZ_SERVICE_URL}/${quizId}`);
        const quiz = response.data;

        if (!quiz) throw new Error('Quiz not found');

        const score = calculateScore(quiz.questions, answers);

        // Update Submission
        await Submission.findByIdAndUpdate(submissionId, {
            score,
            status: 'Graded',
            gradedAt: new Date()
        });

        console.log(`Graded submission ${submissionId}: Score ${score}`);
    } catch (error) {
        console.error(`Error grading submission ${submissionId}:`, error);
        await Submission.findByIdAndUpdate(submissionId, {
            status: 'Error' // You might want to add an error status to your schema
        });
    }
});

module.exports = gradingQueue;
