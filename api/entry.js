const express = require('express');
const timeApi  = require('./time.js');
const headerParser = require('./headerParser.js');
const urlShortener = require('./urlShortener.js');
const imageSearch = require('./imageSearch.js');

const api = express.Router();

api.use(timeApi);
api.use(headerParser);
api.use(urlShortener);
api.use(imageSearch);

module.exports = api;

