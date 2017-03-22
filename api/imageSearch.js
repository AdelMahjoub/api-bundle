const express = require('express');
const isEmpty = require('../src/functions.js');
const axios = require('axios');
const validator = require('validator');
const mysql = require('mysql');

const imageSearch = express.Router();

// Connect to database
const db = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB
});

// Prepare then return the response from the search API
const handleResponse = function(response) {
  let data = [];
  response.forEach(function(obj) {
    let result = {
      name: '',
      thumbnailUrl: '',
      hostPageDisplayUrl: '',
      datePublished: '',
      encodingFormat: '',
      contentSize: ''
    }
    Object.keys(obj).forEach(function(key) {
      if(result.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
    });
    data.push(result);
  });
  return data;
}

// Return the 10 latest searched terms
const searchTermsHistoryHandler = function(req, res, next) {
  db.getConnection(function(connErr, connection) {
    if(connErr) {
      return res.status(500).send('Sorry, an unexpected error occured, please try again.');
    } else {
      connection.query(`SELECT searchTerm AS term, searchDate AS date FROM SearchHistory ORDER BY searchDate DESC LIMIT 10`, function(queryErr, results, fields) {
        if(queryErr) {
         return res.status(500).send('Sorry, an unexpected error occured, please try again.');
        } else {
          connection.release();
          return res.json(results);
        }
      });
    }
  });
}

// Handles the user search request
const searchRequestHandler = function(req, res, next) {
  // Prepare query variables
  let searchQuery, countQuery, offsetQuery;
  // Check the query 
  if(isEmpty(req.query)) {
    // Query is empty => render the landing page 
    return next();
    // Query contains something
  } else {
    if(!req.query.hasOwnProperty('search')) {
      // Wrong Query, query does not contains the key: search=> Bad request error response
      return res.json({
        status: 400,
        error: 'Bad Request',
        message: 'query string should begin by ?search=<string>'
      });
    } else {
      // Sanitize search query
      searchQuery = validator.escape(req.query['search']);
      //Wrong query, search query is empty => Bad request error response
      if(searchQuery === '') {
        return res.json({
          status: 400,
          error: 'Bad Request',
          message: 'search query should not be empty'
        });
      } else {
        // Add the search term to the database
        db.getConnection(function(error, connection) {
          // Internal error
          if(error) {
            return res.status(500).send('Sorry, an unexpected error occured, please try again.');
          } else {
            connection.query(`INSERT INTO SearchHistory (searchTerm) VALUES ('${searchQuery}')`, function(err, results, fields) {
              if(err) {
                return res.status(500).send('Sorry, an unexpected error occured, please try again.');
              } else {
                connection.release();
              }
            });
          }
        })
      }
      // Check for optional 'count' query
      // If available
      if(req.query.hasOwnProperty('count')) {
        // Sanitize count query value
        countQuery = validator.escape(req.query['count']);
        // Check if the count query is a number
        if(isNaN(countQuery)) {
          // Wrong query => Bad request error response
          return res.json({
            status: 400,
            error: 'Bad request',
            message: 'count should be a number'
          });
        }
      }
      // Check for optional offset query
      // If available
      if(req.query.hasOwnProperty('offset')) {
        // Sanitize count query value
        offsetQuery = validator.escape(req.query['offset']);
        // Check if the count query is a number
        if(isNaN(offsetQuery)) {
          // Wrong query => Bad request error response
          return res.json({
            status: 400,
            error: 'Bad request',
            message: 'offset should be a number'
          });
        }
      }
      // Make the search request
      let userAgent = req.headers['user-agent'];
      let language = req.headers['accept-language'];

      axios.get(process.env.API_END_POINT, {
        headers: {
          'Ocp-Apim-Subscription-Key': process.env.SEARCH_API_KEY,
          'User-Agent': userAgent,
          'Accept-Language': language
        },
        params: {
          q: searchQuery,
          count: countQuery || 10,
          offset: offsetQuery || 0,
          mkt: language,
          safeSearch: 'Moderate'
        }
      })
      .then(function(response) {
        let data = handleResponse(response.data.value);
        return res.status(200).json(data);
      })
      .catch(function(error) {
        return res.status(500).send('Sorry, an unexpected error occured, please try again.');
      });
    }
  }
}

imageSearch.get('/api/image', function(req, res, next) {
  searchRequestHandler(req, res, next);
}, function(req, res, next) {
  return res.redirect('/');
});

imageSearch.get('/api/image/history', function(req, res, next) {
  searchTermsHistoryHandler(req, res, next);
});

module.exports = imageSearch;
