const express = require('express');
const router = express.Router();
const axios = require('axios');
const Users = require('../models/Users');

/**
 * GET users listing.
 * @name  GET/api/users
 */
router.get('/', async function(req, res, next) {
  if (req.session.kerberos) {
    user = await Users.getUser(req.session.kerberos);
    if (user)
      res.status(200).json({
        authToken: req.session.authToken,
        name: req.session.name,
        kerberos: req.session.kerberos
      }).end();
    else
      res.status(401).json({error: 'You are not yet registered for dormpoll'}).end();
  } else
    res.status(401).json({error: 'Not currently logged in'}).end();
});

/**
 * Get all users
 */
router.get('/all', async function(req, res, next){
  const username = req.session.kerberos;
  if (username !== undefined) {
    const isAdmin = await Users.isAdmin(username);
    if (isAdmin) {
      let response = await Users.getAllUsers();
      res.status(200).json({
        users: response,
      }).end();
    } else {
      res.status(403).json({
        error: `You can't add a user without being an admin!`
      }).end();
    }
  } else {
    res.status(401).json({
      error: `You can't add a user without signing in!`,
    }).end();
  }
});

/**
 * POST create a specific user
 * @name POST/api/users/create/:username
 */
router.post('/create/:kerberos', async function(req,res,next){
  const username = req.session.kerberos;
  if (username !== undefined) {
    const isAdmin = await Users.isAdmin(username);
    if (isAdmin) {
      let user = await Users.getUser(req.params.kerberos);
      if (user === undefined){
        let response = await Users.addUser(req.params.kerberos);
        res.status(200).json({
          user: response,
        }).end();
      }else{
        res.status(400).json({
          error:`User already exists!`
        }).end();
      }
    } else {
      res.status(403).json({
        error: `You can't add a user without being an admin!`
      }).end();
    }
  } else {
    res.status(401).json({
      error: `You can't add a user without signing in!`,
    }).end();
  }
});

/**
 * DELETE a specific user
 * @name DELETE/api/users/:userId
 * @throws {401}
 */
router.delete('/:userId', async function(req,res,next){
  const username = req.session.kerberos;
  if (username !== undefined) {
    const isAdmin = await Users.isAdmin(username);
    if (isAdmin) {
      let user = await Users.getUserById(req.params.userId);
      if (user !== undefined){
        let response = await Users.deleteUser(req.params.userId);
        res.status(200).json({
          user: response,
        }).end();
      }else{
        res.status(400).json({
          error:`User does not exist!`
        }).end();
      }
    } else {
      res.status(403).json({
        error: `You can't delete a user without being an admin!`
      }).end();
    }
  } else {
    res.status(401).json({
      error: `You can't delete a user without signing in!`,
    }).end();
  }
});

/**
 * POST sends authToken to login, for now saves token, name, kerb in session
 * @name  POST/api/users/login
 */
router.post('/login', async (req, res, next) => {
  try{
    let resp = await axios.get("https://oidc.mit.edu/userinfo", { headers: {"Authorization" : `Bearer ${req.body.authToken}`} });
    req.session.name = resp.data.name;
    req.session.authToken = req.body.authToken;
    req.session.kerberos = resp.data.email.match(/^.*(?=@mit\.edu$)/)[0]; // use regex to kerberos from mit email
    res.status(200).json({authToken: req.session.authToken, name: req.session.name, kerberos: req.session.kerberos}).end();
  }
  catch (err) {
    res.status(400).json({error: 'Token invalid'})
  }
});

/**
 * POST logs out user by forgetting session
 * @name  POST/api/users/logout
 */
router.post('/logout', function(req, res, next) {
  req.session.destroy();
  res.status(200).json({}).end();
});

module.exports = router;
