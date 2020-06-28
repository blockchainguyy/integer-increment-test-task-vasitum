const express = require('express');
const router = express.Router();
const userService = require('./user.service');

// user routes
router.post('/users/authenticate', authenticateUser);
router.post('/users/register', registerUser);
router.get('/users/', getAllUsers);
router.get('/users/current', getCurrentUser);
router.delete('/users/current', _deleteUser);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);

// identifier routes
router.get('/current', getCurrentIdentifier);
router.put('/current', updateIdentifier);
router.get('/next', getNextIdentifier);

module.exports = router;

function authenticateUser(req, res, next) {
  userService
    .authenticate(req.body)
    .then((user) =>
      user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' })
    )
    .catch((err) => next(err));
}

function registerUser(req, res, next) {
  userService
    .create(req.body)
    .then(() => res.json({ success: true }))
    .catch((err) => next(err));
}

function getAllUsers(req, res, next) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch((err) => next(err));
}

function getCurrentUser(req, res, next) {
  userService
    .getById(req.user.sub)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch((err) => next(err));
}

function getCurrentIdentifier(req, res, next) {
  userService
    .getById(req.user.sub)
    .then((user) => (user ? res.json({ current: user.identifier }) : res.sendStatus(404)))
    .catch((err) => next(err));
}

function getNextIdentifier(req, res, next) {
  userService
    .getById(req.user.sub)
    .then((user) => (user ? res.json({ next: user.identifier + 1 }) : res.sendStatus(404)))
    .catch((err) => next(err));
}

function getUserById(req, res, next) {
  userService
    .getById(req.params.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch((err) => next(err));
}

function updateUser(req, res, next) {
  userService
    .update(req.params.id, req.body)
    .then(() => res.json({ success: true }))
    .catch((err) => next(err));
}

function updateIdentifier(req, res, next) {
  const { current } = req.body;

  // validate
  Number.isInteger(current);
  userService
    .update(req.user.sub, { identifier: req.body.current })
    .then(() => res.json({ success: true }))
    .catch((err) => next(err));
}

function _deleteUser(req, res, next) {
  userService
    .delete(req.user.sub)
    .then(() => res.json({ success: true }))
    .catch((err) => next(err));
}
