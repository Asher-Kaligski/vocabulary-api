const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const mongoose = require('mongoose');
const { Letter, validate } = require('../models/letter');
const express = require('express');
const router = express.Router();

router.get('/names', async (req, res) => {
  const letters = await Letter.find()
    .select({ name: 1, letterId: 1, _id: 0 })
    .sort({ letterId: 1 });
  res.send(letters);
});

router.get('/', async (req, res) => {
  const letters = await Letter.find().sort({ letterId: 1 });
  res.send(letters);
});

router.get('/:id', async (req, res) => {
  let letter = await Letter.findOne({ letterId: req.params.id });
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
  if (error) res.status(400).send(error.details[0].message);

  let letter = await Letter.findOne({ letterId: req.params.id });
  if (!letter)
    res.status(404).send('The letter with given ID has not been found');

  letter.name = req.body.name;
  letter.title = req.body.title;
  letter.words = req.body.words;
  letter = await letter.save();

  res.send(letter);
});

module.exports = router;
