const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const userShortSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
});

const MIN_LENGTH = 1;
const MAX_LENGTH = 10024;

const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: MIN_LENGTH,
    maxlength: MAX_LENGTH,
    required: true,
  },
  user: {
    type: userShortSchema,
    required: true,
  },
  isApproved: {
    type: Boolean,
    required: true,
    default: false,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

function validateCommentReply(reply) {
  const schema = Joi.object({
    content: Joi.string().required(),
    userId: Joi.string().required(),
    isApproved: Joi.boolean(),
  });

  return schema.validate(reply);
}

module.exports.validateCommentReply = validateCommentReply;
module.exports.replySchema = replySchema;
