const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const autoincrement = require('simple-mongoose-autoincrement');

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

module.exports.validate = validateLetter;
module.exports.Letter = Letter;
