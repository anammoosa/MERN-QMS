const Joi = require('joi');

const questionSchema = Joi.object({
    text: Joi.string().required(),
    type: Joi.string().valid('MCQ', 'Multi-Select', 'True/False').required(),
    options: Joi.array().items(Joi.string()),
    correctAnswer: Joi.string().required(),
    points: Joi.number().default(1)
});

const quizSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow('', null),
    instructorId: Joi.string().required(), // Should be a valid ObjectId string
    questions: Joi.array().items(questionSchema).min(1).required(),
    startTime: Joi.date().iso().allow(null),
    endTime: Joi.date().iso().allow(null),
    duration: Joi.number().integer().positive().allow(null),
    isPublished: Joi.boolean()
});

module.exports = { quizSchema };
