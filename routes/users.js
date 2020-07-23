const auth = require('../middleware/auth');
const { ADMIN } = require('../constants/roles');
const admin = require('../middleware/admin');
const mongoose = require('mongoose');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const { User, validate } = require('../models/user');
const express = require('express');
const router = express.Router();

router.get('/', [auth, admin], async (req, res) => {
  const users = await User.find();
  res.send(users);
});

router.get('/:id', auth, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send('Invalid User.');

  if (req.params.id !== req.user._id && !req.user.roles.includes(ADMIN))
    return res.status(400).send('Not allowed to update user');

  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).send('The user with given ID has not been found');

  res.send(
    _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'phone', 'roles'])
  );
});

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user)
    return res.status(404).send('The user with given ID has not been found');

  res.send(
    _.pick(user, ['_id', 'firstName', 'lastName', 'email', 'phone', 'roles'])
  );
});

router.put('/:id', auth, async (req, res) => {
  const { error } = await validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send('Invalid User.');

  if (req.params.id !== req.user._id && !req.user.roles.includes(ADMIN))
    return res.status(400).send('Not allowed to update user');

  let user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).send('The user with given ID has not been found');

  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.phone = req.body.phone;
  user.password = req.body.password;

  if (req.user.roles.includes(ADMIN) && !user.roles.includes(ADMIN))
    user.roles = req.body.roles;

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res
    .header('x-auth-token', token)
    .send(_.pick(user, ['_id', 'firstName', 'lastName', 'email', 'roles']));
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user)
    return res
      .status(400)
      .send(`The user with email: ${req.body.email} already exists`);

  user = new User(
    _.pick(req.body, ['firstName', 'lastName', 'email', 'phone', 'password'])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res
    .header('x-auth-token', token)
    .send(_.pick(user, ['_id', 'firstName', 'lastName', 'email', 'roles']));
});

module.exports = router;
