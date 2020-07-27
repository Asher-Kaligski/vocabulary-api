const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const autoincrement = require('simple-mongoose-autoincrement');
const { commentSchema } = require('./comment');

const MIN_LENGTH = 1;
const MAX_LENGTH = 10024;


const letterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: MIN_LENGTH,
    maxlength: MAX_LENGTH,
  },
  title: {
    type: String,
    required: true,
    minlength: MIN_LENGTH,
    maxlength: MAX_LENGTH,
  },
  words: [
    {
      name: {
        type: String,
        required: true,
        minlength: MIN_LENGTH,
        maxlength: MAX_LENGTH,
      },
      description: {
        type: String,
        required: true,
        minlength: MIN_LENGTH,
        maxlength: MAX_LENGTH,
      },
    },
  ],
  comments: 
  [
    commentSchema
  ]
  
});

letterSchema.plugin(autoincrement, { field: 'letterId' });
const Letter = mongoose.model('Letter', letterSchema);

function validateLetter(letter) {
  const schema = Joi.object({
    name: Joi.string().min(MIN_LENGTH).max(MAX_LENGTH).required(),
    title: Joi.string().required(),
    words: Joi.array(),
  });

  return schema.validate(letter);
}
function validateWord(word) {
  const schema = Joi.object({
    description: Joi.string().min(MIN_LENGTH).max(MAX_LENGTH).required(),
    name: Joi.string().min(MIN_LENGTH).max(MAX_LENGTH).required(),
    wordId: Joi.string().default(null),
  });

  return schema.validate(word);
}

module.exports.validate = validateLetter;
module.exports.validateWord = validateWord;
module.exports.Letter = Letter;
