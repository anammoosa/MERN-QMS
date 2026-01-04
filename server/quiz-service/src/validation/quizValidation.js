const Joi = require('joi');

const questionSchema = Joi.object({
    text: Joi.string().required(),
    type: Joi.string().valid('MCQ', 'Multi-Select', 'True/False', 'Short Answer').required(),
    // Options are optional for Short Answer
    options: Joi.array().items(Joi.string()).allow(null),
    // Correct Answer can be string or array (for multi-select)
    correctAnswer: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string()), Joi.boolean()).required(),
    points: Joi.number().default(1),
    // Allow ID to pass through
    id: Joi.any(),
    _id: Joi.any()
});

const quizSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow('', null),
    instructorId: Joi.string().required(), // Should be a valid ObjectId string
    questions: Joi.array().items(questionSchema).min(1).required(),
    startTime: Joi.date().iso().allow(null),
    endTime: Joi.date().iso().allow(null),
    duration: Joi.number().integer().min(0).allow(null),
    isPublished: Joi.boolean()
});

module.exports = { quizSchema };
