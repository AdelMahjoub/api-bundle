const express = require('express');
const http = require('http');

const headerParser = express.Router();

const getData = function(req, res, next) {
  let info = {}; // data to send
  info.ip = req.get("X-Forwarded-For") || "0.0.0.0";
  info.language = req.get("Accept-Language").split(",")[0];
  info.software = req.get("user-agent").match(/\(.+?\)/)[0];
  info.user_agent = req.get("user-agent");
  // Get GeoIP info
  http.get("http://freegeoip.net/json/" + info.ip, function(response) {
    response.setEncoding('utf8');
    response.on("data", function(data) {
      info.location = JSON.parse(data.toString());
      return res.json(info);
    });
  });
}

headerParser.get("/api/geoip", function(req, res, next) {
  getData(req, res, next);
});


module.exports = headerParser;