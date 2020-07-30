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

const replySchema = new mongoose.Schema({
  commentId: {
    type: String,
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

replySchema.plugin(autoincrement, { field: 'replyId' });
const Reply = mongoose.model('Reply', replySchema);

function validateComment(reply) {
  const schema = Joi.object({
    commentId: Joi.string().required(),
    content: Joi.string().required(),
    userId: Joi.string().required(),
    isApproved: Joi.boolean(),
  });

  return schema.validate(reply);
}

module.exports.validate = validateComment;
module.exports.Reply = Reply;
module.exports.replySchema = replySchema;
