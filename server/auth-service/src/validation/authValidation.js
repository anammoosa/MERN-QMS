const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('Student', 'Instructor').default('Student')
});

const loginSchema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
});

module.exports = { registerSchema, loginSchema };
