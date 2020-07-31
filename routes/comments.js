const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const mongoose = require('mongoose');
const { Letter } = require('../models/letter');
const { User } = require('../models/user');
const {
  Comment,
  validate,
  validateCommentReply,
} = require('../models/comment');
const { ADMIN } = require('../constants/roles');
const url = require('url');
const express = require('express');
const router = express.Router();

router.get('/', [auth, admin], async (req, res) => {
  const query = url.parse(req.url, true).query;

  if (!query.userId)
    return res.send(await Comment.find().sort({ commentId: -1 }));

  const comments = await Letter.find({ 'user._id': query.userId });
  if (comments.length === 0)
    return res
      .status(400)
      .send(`Comments of the userID ${query.userId} have not been found`);

  res.send(comments);
});

router.get('/:id', [auth, admin], async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment)
    res.status(404).send('The comment with given ID has not been found');

  res.send(comment);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let letter = await Letter.findOne({ name: req.body.letterName });
  if (!letter)
    return res
      .status(400)
      .send('The letter with given name has not been found');

  if (req.body.userId !== req.user._id && !req.user.roles.includes(ADMIN))
    return res.status(400).send('Invalid userId');

  const user = await User.findById(req.body.userId);
  if (!user)
    return res.status(400).send('The user with given name has not been found');

  let comment = new Comment({
    letterName: letter.name,
    content: req.body.content,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    },
  });

  if (req.user.roles.includes(ADMIN) && req.body.isApproved)
    comment.isApproved = req.body.isApproved;

  comment = await comment.save();

  letter.comments.push(comment);

  await letter.save();

  res.send(comment);
});

router.put('/:id', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let comment = await Comment.findById(req.params.id);
  if (!comment)
    return res.status(404).send('The comment with given ID has not been found');

  comment.content = req.body.content;
  comment.isApproved = req.body.isApproved;

  comment = await comment.save();

  let letter = await Letter.findOne({ name: comment.letterName });
  const index = letter.comments.findIndex(
    (c) => c.commentId === comment.commentId
  );

  if (index !== -1) letter.comments[index] = comment;

  await letter.save();

  res.send(comment);
});

router.delete('/:id', [auth, admin], async (req, res) => {
  let comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment)
    return res.status(404).send('The comment with given ID has not been found');

  let letter = await Letter.findOne({ name: comment.letterName });
  const index = letter.comments.findIndex(
    (c) => c.commentId === comment.commentId
  );

  if (index !== -1) letter.comments.splice(index, 1);

  await letter.save();

  res.send(comment);
});

router.post('/:id', auth, async (req, res) => {
  const { error } = validateCommentReply(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let comment = await Comment.findById(req.params.id);
  if (!comment)
    return res.status(400).send('The comment with given ID has not been found');

  let letter = await Letter.findOne({ name: comment.letterName });
  if (!letter)
    return res
      .status(400)
      .send('The letter with given name has not been found');

  if (req.body.userId !== req.user._id && !req.user.roles.includes(ADMIN))
    return res.status(400).send('Invalid userId');

  const user = await User.findById(req.body.userId);
  if (!user)
    return res.status(400).send('The user with given name has not been found');

  let commentReply = {
    content: req.body.content,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    },
  };

  if (req.user.roles.includes(ADMIN) && req.body.isApproved)
    commentReply.isApproved = req.body.isApproved;

  comment.replies.push(commentReply);

  comment = await comment.save();

  const index = letter.comments.findIndex(
    (c) => c.commentId === comment.commentId
  );

  if (index !== -1) letter.comments[index] = comment;

  await letter.save();

  res.send(comment);
});

/*router.patch('/:id/replyId/:replyId', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let comment = await Comment.findById(req.params.id);
  if (!comment)
    return res.status(404).send('The comment with given ID has not been found');

  comment.content = req.body.content;
  comment.isApproved = req.body.isApproved;

  comment = await comment.save();

  let letter = await Letter.findOne({ name: comment.letterName });
  const index = letter.comments.findIndex(
    (c) => c.commentId === comment.commentId
  );

  if (index !== -1) letter.comments[index] = comment;

  await letter.save();

  res.send(comment);
});

router.delete('/:id/replyId/:replyId', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let comment = await Comment.findById(req.params.id);
  if (!comment)
    return res.status(404).send('The comment with given ID has not been found');

  comment.content = req.body.content;
  comment.isApproved = req.body.isApproved;

  comment = await comment.save();

  let letter = await Letter.findOne({ name: comment.letterName });
  const index = letter.comments.findIndex(
    (c) => c.commentId === comment.commentId
  );

  if (index !== -1) letter.comments[index] = comment;

  await letter.save();

  res.send(comment);
});*/

module.exports = router;
