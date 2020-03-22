"use strict"

const isEmpty = require("is-empty")
const path = require("path")
const { loggerTimes } = require("../utils")

const pinoOptions = {
  timestamp: loggerTimes
}

module.exports = options => {
  const accessLogger = require("pino")(pinoOptions, path.join(__dirname, "../logs", "mysql/query-access.log"))
  const errorLogger = require("pino")(pinoOptions, path.join(__dirname, "../logs", "mysql/query-error.log"))
  const pool = require("knex")(options)
  pool
    .on("query", query => {
      if (query.bindings) {
        for (let bind of query.bindings) {
          if (!isEmpty(bind)) {
            bind = `'${bind}'`
          }
          query.sql = query.sql.replace("?", bind)
        }
      }
      // save log file
      accessLogger.info(
        `[Raw] ${query.sql
          .replace(/\\/g, "")
          .replace(/\[/g, "")
          .replace(/\]/g, "")
          .replace(/\n {6}/g, "")}`
      )
    })
    .on("query-error", (error, obj) => {
      errorLogger.error(`[Message] ${error.sqlMessage || error}`)
    })
  return pool
}
