const oidc = require('./OidcConstants');
const express = require('express');
const router = express.Router();
const axios = require('axios');
const qs = require('qs');

/**
 * Create a new Response.
 * @name  GET/login
 * @throws {403} - if there is an invalid login
 */
router.get('/', async function(req, res) {
  if (req.query.code && req.query.state) {
    const requestBody = qs.stringify({
      grant_type: 'authorization_code',
      code: req.query.code,
      redirect_uri: oidc.url,
      client_id: oidc.client_id,
      client_secret: oidc.client_secret
    });
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    };
    try {
      let response = await axios.post("https://oidc.mit.edu/token", requestBody, config.headers);
      response = await axios.post(`${oidc.base_url}/api/users/login`, {authToken: response.data.access_token});
      req.session.name = response.data.name;
      req.session.authToken = response.data.authToken;
      req.session.kerberos = response.data.kerberos;
    } catch (err) {
      res.status(403).json({
        error: "Invalid login",
      }).end();
    }
  }
  res.redirect('/')
});



module.exports = router;
