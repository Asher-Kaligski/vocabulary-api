const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const mongoose = require('mongoose');
const { Letter, validate, validateWord } = require('../models/letter');
const { Comment } = require('../models/comment');
const url = require('url');
const express = require('express');
const router = express.Router();

router.get('/names', async (req, res) => {
  const letters = await Letter.find()
    .select({ name: 1, letterId: 1, _id: 0 })
    .sort({ letterId: 1 });
  res.send(letters);
});

router.get('/', async (req, res) => {
  const query = url.parse(req.url, true).query;

  if (!query.letter) return res.send(await Letter.find().sort({ letterId: 1 }));

  let letter = await Letter.findOne({ name: query.letter });
  if (!letter)
    return res
      .status(400)
      .send(`The letter with name ${query.letter} has not been found`);

  res.send(letter);
});

router.get('/:id', async (req, res) => {
  let letter = await Letter.findOne({ letterId: req.params.id }).populate(
    'comments'
  );
  if (!letter)
    res.status(404).send('The letter with given ID has not been found');

  res.send(letter);
});

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let letters = await Letter.find().select({ name: 1, _id: 0 });

  letters = letters.map((obj) => obj.name);

  if (letters.includes(req.body.name))
    return res
      .status(400)
      .send(`The letter ${req.body.name} is already exists`);

  let letter = new Letter({ ...req.body });
  letter = await letter.save();
  res.send(letter);
});

router.put('/:id', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let letter = await Letter.findOne({ letterId: req.params.id });
  if (!letter)
    return res.status(404).send('The letter with given ID has not been found');

  letter.name = req.body.name;
  letter.title = req.body.title;
  letter.words = req.body.words;
  letter = await letter.save();

  res.send(letter);
});

router.patch('/:id', [auth, admin], async (req, res) => {
  const { error } = validateWord(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let letter = await Letter.findOne({ letterId: req.params.id });
  if (!letter)
    return res.status(404).send('The letter with given ID has not been found');

  let word;
  if (!req.body.wordId) {
    letter.words.push({
      name: req.body.name,
      description: req.body.description,
    });
    word = letter.words[letter.words - 1];
  } else {
    const index = letter.words.findIndex(
      (w) => w._id.toString() === req.body.wordId
    );

    if (index === -1)
      return res.status(404).send('The word has not been found');

    letter.words[index].name = req.body.name;
    letter.words[index].description = req.body.description;

    word = letter.words[index];
  }

  await letter.save();

  res.send(word);
});

router.delete('/:id/wordId/:wordId', [auth, admin], async (req, res) => {

  let letter = await Letter.findOne({ letterId: req.params.id });
  if (!letter)
    return res.status(404).send('The letter with given ID has not been found');

  const index = letter.words.findIndex(
    (w) => w._id.toString() === req.params.wordId
  );

  if (index === -1) return res.status(404).send('The word has not been found');

  letter.words.splice(index, 1);

  letter = await letter.save();

  res.send({ response: 'success' });
});

module.exports = router;
