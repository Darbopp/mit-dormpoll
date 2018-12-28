const express = require('express');
const router = express.Router();
const Polls = require('../models/Polls');
const Responses = require('../models/Responses');
const Users = require('../models/Users');

/**
 * Create a new Response.
 * @name  POST/api/responses
 * @return {string} - message with status of creating a new response
 * @throws {400} - if an empty response is sent
 * @throws {401} - if user is not signed in
 * @throws {403} - if user not able to successfully send or update a response
 */
router.post('/', async function(req, res) {
  const username = req.session.kerberos;
  if (username !== undefined) {
    const choices = req.body; // {questionId: choiceId}
    if (Object.keys(choices).length !== 0) {
      const hasAlreadyVotedInPoll = await Polls.hasAlreadyVotedInPoll(username, choices);
      if (!hasAlreadyVotedInPoll) {
        const newResponse = await Responses.sendResponse(username, choices);
        if (newResponse.success) {
          res.status(200).json(newResponse.message).end();
        } else {
          res.status(403).json({
            error: newResponse.message,
          }).end();
        }
      } else {
        const updatedResponse = await Responses.updateResponse(username, choices);
        if (updatedResponse.success) {
          res.status(200).json(updatedResponse.message).end();
        } else {
          res.status(403).json({
            error: updatedResponse.message,
          }).end();
        }
      }
    } else {
      res.status(400).json({
        error: `You can't send in an empty response.`,
      }).end();
    }
  } else {
    res.status(401).json({
      error: `You can't create a response without signing in!`,
    }).end();
  }
});

/**
 * Get a user's response to a poll
 * @name  GET/api/responses/:pollId
 * @return {Array[Object]} - answers that corresponds to a user's response for a poll
 * @throws {401} - if user is not signed in
 */
router.get('/:pollId', async function(req, res) {
  const username = req.session.kerberos;
  if (username !== undefined) {
    const pid = req.params.pollId; // {questionId: choiceId}
    let responses = await Responses.getResponse(username, pid)
    res.status(200).json(responses).end();
  } else {
    res.status(401).json({
      error: `You are not signed in!`,
    }).end();
  }
});

/**
 * Get results of a Poll.
 * @name GET/api/responses/:pollId/results
 * @return {Array[Object]} - [{questionId: int, question: string, response: []}]
 * @throws {401} - if user is not signed in
 * @throws {403} - if user is not admin
 */
router.get('/:pollId/results', async function(req, res) {
  const username = req.session.kerberos;
  const pollId = req.params.pollId;
  if (username !== undefined) {
    const isAdmin = await Users.isAdmin(username);
    if (isAdmin) {
      const answers = await Responses.getAnswers(pollId);
      res.status(200).json(answers).end();
    } else {
      res.status(403).json({
          error: `You can't view results you are not the admin of.`
        }).end();
    }
  } else {
    res.status(401).json({
      error: `You can't view poll results without signing in!`,
    }).end();
  }
});

/**
 * Get results sheet of a Poll.
 * @name GET/api/responses/:pollId/sheet
 * @throws {401} - if user is not signed in
 * @throws {403} - if user is not admin
 */
router.get('/:pollId/sheet', async function(req, res) {
  const username = req.session.kerberos;
  const pollId = req.params.pollId;
  if (username !== undefined) {
    const isAdmin = await Users.isAdmin(username);
    if (isAdmin) {
      const answers = await Responses.getSheet(pollId);
      res.status(200).json(answers).end();
    } else {
      res.status(403).json({
        error: `You can't view results you are not the admin of.`
      }).end();
    }
  } else {
    res.status(401).json({
      error: `You can't view poll results without signing in!`,
    }).end();
  }
});

module.exports = router;
