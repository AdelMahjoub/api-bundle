const express = require('express');
const moment = require("moment");

const timeApi = express.Router();

const isValid = function(string) {
  const validFormat = [
    "dddd, MMMM Do YYYY",
    "dddd, MMMM DD YYYY",
    "dddd, MMMM D YYYY",
    "dddd Do MMMM YYYY",
    "dddd DD MMMM YYYY",
    "dddd D MMMM YYYY",
    "dddd MMMM Do YYYY",
    "dddd MMMM DD YYYY",
    "dddd MMMM D YYYY",
  ]
  if(moment(string, "X", true).isValid()) {
    return moment(string, "X");
  } else if(moment(string, validFormat, true).isValid()) {
    return moment(string, validFormat);
  } else if(moment(string, moment.ISO_8601, true).isValid()) {
    return moment(string, moment.ISO_8601);
  }else if(moment(string.replace(/\s/g, "-"), moment.ISO_8601).isValid()){
    return moment(string.replace(/\s/g, "-"), moment.ISO_8601);
  }
  return false;
}

const dateValidator = function(string) {
  if(!isValid(string)) {
    return {
      unix: null,
      natural: null
    };
  }
  return {
    unix: moment(isValid(string)).format("X"),
    unixMilliseconds: moment(isValid(string)).format("x"),
    natural: moment(isValid(string)).format("dddd, MMMM Do YYYY"),
    isoString: moment(isValid(string)).toISOString(),
    parsed: moment(isValid(string)).toObject()
  }
}

timeApi.get("/api/time/:params", function(req, res, next) {
  res.status(200).json(dateValidator(req.params.params));
});

module.exports = timeApi;
