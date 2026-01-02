const Joi = require('joi');

const submissionSchema = Joi.object({
    userId: Joi.string().required(),
    quizId: Joi.string().required(),
    answers: Joi.array().items(Joi.object({
        questionId: Joi.string().required(),
        selectedOptions: Joi.any().required()
    })).required()
});

module.exports = { submissionSchema };
