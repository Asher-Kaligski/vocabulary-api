const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const autoincrement = require('simple-mongoose-autoincrement');

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

const commentSchema = new mongoose.Schema({
  letterName: {
    type: String,
    required: true,
    minlength: MIN_LENGTH,
    maxlength: MAX_LENGTH,
    required: true,
  },
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
});

commentSchema.plugin(autoincrement, { field: 'commentId' });
const Comment = mongoose.model('Comment', commentSchema);

function validateComment(comment) {
  const schema = Joi.object({
    letterName: Joi.string().required(),
    content: Joi.string().required(),
    userId: Joi.string().required(),
    isApproved: Joi.boolean(),
  });

  return schema.validate(comment);
}

module.exports.validate = validateComment;
module.exports.Comment = Comment;
module.exports.commentSchema = commentSchema;
