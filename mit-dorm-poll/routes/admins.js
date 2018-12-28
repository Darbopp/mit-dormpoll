const express = require('express');
const router = express.Router();
const axios = require('axios');
const Users = require('../models/Users');

/**
 * GET current admin status of logged in user
 * @name  GET/api/admins/status
 * @return {boolean} - Represents admin status of current user
 */
router.get('/status', async function(req, res, next) {
  const username = req.session.kerberos;
  if (username !== undefined) {
    const isAdmin = await Users.isAdmin(username);
    if (isAdmin) {
      res.status(200).json({admin: true}).end();
    } else {
      res.status(200).json({admin: false}).end();
    }
  } else {
    res.status(200).json({admin: false}).end();
  }
});

/**
 * GET all current admins
 * @name  GET/api/admins
 * @return {Array[Object]} - Array of admins represented as {userId: userId, kerberos: kerberos}
 */
router.get('/', async function(req, res, next) {
  const admins = await Users.getAdmins();
  res.status(200).json({admins: admins}).end();
});

/**
 * POST add a new admin
 * @name  POST/api/admins/
 * @return {int} userId of the user having their admin status changed
 * @throws {401} - if user does not exist or no one is logged in
 * @throws {403} - if a non-admin is attempting to add an admin
 */
router.post('/', async function(req, res, next) {
  const kerberos = req.body.adminKerberos;
  const user = await Users.getUser(kerberos);
  if (user === undefined) { // user does not already exist
    res.status(401).json({
      error: `This user doesn't exist!`
    }).end();
  } else {
    const username = req.session.kerberos;
    if (username !== undefined) {
      const isAdmin = await Users.isAdmin(username);
      if (isAdmin) {
        const newStatus = await Users.setAdminStatus(user.userId, true);
        res.status(200).json({admin: newStatus}).end();
      } else {
        res.status(403).json({
          error: `Only an admin can add an admin!`,
        }).end();
      }
    } else {
      res.status(401).json("You must sign in.");
    }
  }
});

/**
 * DELETE an existing admin
 * @name  DELETE/api/admins/:userId
 * @return {int} userId of the user having their admin status changed
 * @throws {400} - if user to be deleted is not an admin
 * @throws {401} - if user does not exist or no one is logged in
 * @throws {403} - if a non-admin is attempting to add an admin
 */
router.delete('/:userId', async function(req, res, next) {
  const username = req.session.kerberos;
  if (username !== undefined) {
    const isAdmin = await Users.isAdmin(username);
    if (isAdmin) {
      const userId = req.params.userId;
      const status = req.params.status;
      const checkAdmin = await Users.getAdminStatus(userId);
      if (!checkAdmin) {
        res.status(400).json({
          error: `User is not an admin`,
        }).end();
      }
      const newStatus = await Users.setAdminStatus(userId, false);
      res.status(200).json({admin: newStatus}).end();
    } else {
      res.status(403).json({
        error: `Only an admin can remove an admin!`,
      }).end();
    }
  } else {
    res.status(401).json("You must sign in.");
  }
});

module.exports = router;
