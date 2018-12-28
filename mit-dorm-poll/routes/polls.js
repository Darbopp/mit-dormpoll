const express = require('express');
const router = express.Router();
const Polls = require('../models/Polls');
const Users = require('../models/Users');

/**
 * Create a new Poll.
 * @name POST/api/polls
 * @return {string} - message indicated status of poll being created
 * @throws {401} - if user is not signed in
 * @throws {403} - if user is not admin or not able to successfully create a given poll
 */
router.post('/', async function(req, res) {
  const username = req.session.kerberos;
  if (username !== undefined) {
    const isAdmin = await Users.isAdmin(username);
    if (isAdmin) {
      const pollData = req.body;
      const pollResponse = await Polls.createPoll(pollData, username);
      if (pollResponse.success) {
        res.status(200).json("Success!").end();
      } else {
        res.status(403).json({
          error: pollResponse.message
        }).end();
      }
    } else {
      res.status(403).json({
        error: `You can't create a poll without being an admin!`
      }).end();
    }
  } else {
    res.status(401).json({
      error: `You can't create a poll without signing in!`,
    }).end();
  }
});

/**
 * Edit an existing Poll.
 * @name   PUT/api/polls/:pollId
 * @returns {string} - the time of the edited poll
 * @throws {401} - if user is not signed in
 * @throws {403} - if user is not an admin or not able to successfully edit a poll
 */
router.put('/:pollId', async function(req, res) {
  const username = req.session.kerberos;
  const pollId = req.params.pollId
  if (username !== undefined) {
    const isAdmin = await Users.isAdmin(username);
    if (isAdmin) {
      const data = req.body;
      const newPoll = await Polls.editPoll(pollId, data);
      if (newPoll.success) {
        res.status(200).json(newPoll.message).end();
      } else {
        res.status(403).json({
          error: newPoll.message
        }).end();
      }
    } else {
      res.status(403).json({
        error: `Only an admin can edit a poll!`
      }).end();
    }
  } else {
    res.status(401).json({
      error: `You can't edit a poll without signing in!`,
    }).end();
  }
});

/**
 * Get all Polls.
 * @name GET/api/polls
 * @return {Array[Poll]} - array of poll objects
 */
router.get('/', async function(req, res) {
	// Not sure if this is the best structure for this object.
  const allPolls = await Polls.getAllPolls();
  const finalPolls = {polls: allPolls};
  res.status(200).json(finalPolls).end();
});

/**
 * Get a specific poll.
 * @name GET/api/polls/:pollId
 * @return {Poll} - poll object with the specified pollId
 */
router.get('/:pollId', async function(req, res) {
	// Not sure if this is the best structure for this object.
  const poll = await Polls.getPoll(req.params.pollId);
  res.status(200).json({poll: poll}).end();
});

/**
 * Delete a Poll.
 * @name DELETE/api/polls/:pollId
 * @return {string} - message with status of deleting a poll
 * @throws {401} - if user is not signed in
 * @throws {403} - if user is not an admin 
 */
router.delete('/:pollId', async (req, res) => {
  const username = req.session.kerberos;
  const pollId = req.params.pollId;
  if (username !== undefined) {
    const isAdmin = await Users.isAdmin(username);
    if (isAdmin) {
      const deletePollResponse = await Polls.deletePoll(pollId);
      if (deletePollResponse.success) {
        res.status(200).json(deletePollResponse.message).end();
      } else {
        res.status(401).json({
          error: deletePollResponse.message
        }).end();
      }
    } else {
      res.status(403).json({
        error: `Only an admin can delete a poll!`,
      }).end();
    }
  } else {
    res.status(401).json({
      error: `You can't delete a poll without signing in!`,
    }).end();
  }
});

module.exports = router;
