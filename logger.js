"use strict"

const morgan = require("koa-morgan")
const moment = require("moment")
moment.locale("th")

morgan.token("date", (req, res, tz) => {
  const date = new Date()
    .toLocaleString(process.env.DATE_LOCALE, {
      timeZone: process.env.DATE_TIME_ZONE,
      hour12: false
    })
    .replace(/,/g, "")
  return moment(new Date(date)).format(process.env.LOGGER_DATE_FORMAT)
})

module.exports = morgan
