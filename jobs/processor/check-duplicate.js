"use strict"

const KioskService = require("../../services/kiosk.service")
const connections = require("../../connections")
const utils = require("../../utils")
const { queueLogger } = require("../../stream")
const moment = require("moment")
moment.locale("th")

const kioskService = new KioskService({ mssql: connections.mssql })
const LOGNAME = "CHECK-DUPLICATE-RX-NO"

const worker = async data => {
  try {
    const { ophh_data, patient } = data
    if (!ophh_data) {
      // save log
      queueLogger.info({
        process: `[${LOGNAME}]`,
        error: "Missing params 'ophh_data' of job"
      })
      return Promise.reject(new Error("Missing params 'ophh_data' of job"))
    }
    if (!patient) {
      // save log
      queueLogger.info({
        process: `[${LOGNAME}]`,
        error: "Missing params 'patient' of job"
      })
      return Promise.reject(new Error("Missing params 'patient' of job"))
    }
    // process start time
    const start = Date.now()
    // save log
    queueLogger.info({
      process: `1.[${LOGNAME}]`,
      state: `[start process]`,
      startTime: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
    })
    const result = await kioskService.checkDupRxNo(patient, ophh_data)
    // save log
    queueLogger.info({
      process: `2.[${LOGNAME}]`,
      state: `[checkDupRxNo]`,
      data: utils.trimValue(result)
    })

    return Promise.resolve(utils.trimValue(result))
  } catch (error) {
    // save log
    queueLogger.info({
      process: `3.[${LOGNAME}]`,
      state: `[error]`,
      error: error
    })
    return Promise.reject(error)
  }
}

module.exports = async job => {
  const result = await worker(job.data)
  return Promise.resolve(result)
}
