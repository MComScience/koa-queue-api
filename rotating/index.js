"use strict"

const path = require("path")
const rfs = require("rotating-file-stream")
const fs = require("fs")
const CronJob = require("cron").CronJob

const streamOptions = {
  size: "10M", // rotate every 10 MegaBytes written
  interval: "1d", // rotates at every midnight
  compress: true, // compress rotated files
  path: path.join(__dirname, "../logs")
}

// rotating app logging
const accessLogStream = rfs.createStream(path.join("access.log"), Object.assign(streamOptions, {}))
accessLogStream.on("rotated", function(filename) {
  // rotation job completed with success producing given filename
  console.log("rotated", filename)
})

// mssql
rfs.createStream(
  path.join("query-access.log"),
  Object.assign(streamOptions, {
    path: path.join(__dirname, "../logs/mssql")
  })
)
rfs.createStream(
  path.join("query-error.log"),
  Object.assign(streamOptions, {
    path: path.join(__dirname, "../logs/mssql")
  })
)
// mysql
rfs.createStream(
  path.join("query-access.log"),
  Object.assign(streamOptions, {
    path: path.join(__dirname, "../logs/mysql")
  })
)
rfs.createStream(
  path.join("query-error.log"),
  Object.assign(streamOptions, {
    path: path.join(__dirname, "../logs/mysql")
  })
)
rfs.createStream(
  path.join("app-info.log"),
  Object.assign(streamOptions, {
    path: path.join(__dirname, "../logs")
  })
)
rfs.createStream(
  path.join("queue.log"),
  Object.assign(streamOptions, {
    path: path.join(__dirname, "../logs")
  })
)

const clearLog = async () => {
  const logPath = path.join(__dirname, "../logs", "queue.log")
  if (fs.existsSync(logPath)) {
    try {
      fs.writeFileSync(logPath, "")
      console.log("clear log completed.")
    } catch (error) {
      console.log(error)
    }
  }
}

const job = new CronJob("00 00 00 * * *", function() {
  clearLog()
})
job.start()

module.exports = {
  accessLogStream
}
