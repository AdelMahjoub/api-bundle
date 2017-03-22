const express = require('express');
const api = require('../api/entry.js');

const router = express.Router();

router.use(api);

router.get('/', function(req, res, next) {
  res.render('index');
});

// Wrong params, redirect to home page
router.use(function(req, res, next) {
  res.redirect('/');
});

module.exports = router;