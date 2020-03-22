"use strict"

const path = require("path")
// const rfs = require("rotating-file-stream")
const { loggerTimes } = require("../utils")

const pinoOptions = {
  timestamp: loggerTimes
}

// create a rotating write stream
// const accessLogStream = rfs.createStream(process.env.LOGGER_NAME, {
//   size: "10M", // rotate every 10 MegaBytes written
//   interval: "1d", // rotate daily
//   compress: true, // 'gzip', // compress rotated files
//   path: path.join(__dirname, "../logs")
// })

const appLogger = require("pino")(pinoOptions, path.join(__dirname, "../logs", "app-info.log"))
const queueLogger = require("pino")(pinoOptions, path.join(__dirname, "../logs", "queue.log"))

module.exports = {
  appLogger,
  queueLogger
}
