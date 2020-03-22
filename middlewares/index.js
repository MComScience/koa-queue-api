"use strict"

const responseTime = require("./x-response-time")
const logger = require("./logger")
const cors = require("./cors")
const errorHandler = require("./error-handler")
const rateLimiter = require("./rate-limiter")

module.exports = {
  responseTime,
  logger,
  cors,
  errorHandler,
  rateLimiter
}
