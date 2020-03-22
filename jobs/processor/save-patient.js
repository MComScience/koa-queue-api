"use strict"

const KioskService = require("../../services/kiosk.service")
const connections = require("../../connections")
const utils = require("../../utils")
const { queueLogger } = require("../../stream")
const moment = require("moment")
const get = require("lodash/get")
moment.locale("th")

const kioskService = new KioskService({ mssql: connections.mssql })
const LOGNAME = "SavePatient"

const worker = async job => {
  // Extract data from job
  let { ophh_data, patient, hmain, hsub, pay_type } = job.data

  if (!ophh_data) {
    // save log
    queueLogger.info({
      process: `[${LOGNAME}]`,
      error: "Missing params 'ophh_data' of job",
      ophh_data: ophh_data
    })
    return Promise.reject(new Error("Missing params 'ophh_data' of job"))
  }
  if (!patient) {
    // save log
    queueLogger.info({
      process: `[${LOGNAME}]`,
      error: "Missing params 'patient' of job",
      patient: patient
    })
    return Promise.reject(new Error("Missing params 'patient' of job"))
  }
  if (!hmain) {
    // save log
    queueLogger.info({
      process: `[${LOGNAME}]`,
      error: "Missing params 'hmain' of job",
      hmain: hmain
    })
    return Promise.reject(new Error("Missing params 'hmain' of job"))
  }
  if (!hsub) {
    // save log
    queueLogger.info({
      process: `[${LOGNAME}]`,
      error: "Missing params 'hsub' of job",
      hsub: hsub
    })
    return Promise.reject(new Error("Missing params 'hsub' of job"))
  }
  if (!pay_type) {
    // save log
    queueLogger.info({
      process: `[${LOGNAME}]`,
      error: "Missing params 'pay_type' of job",
      pay_type: pay_type
    })
    return Promise.reject(new Error("Missing params 'pay_type' of job"))
  }

  // process start time
  const start = Date.now()
  // save log
  queueLogger.info({
    process: `1.[${LOGNAME}]`,
    state: `[start process]`,
    startTime: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
  })
  console.log("start process:", moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"))
  try {
    patient = utils.updateObject(patient, {
      hn: utils.sprintf(`% 7s`, patient.hn)
    })

    /* ########## STEP 1 ########## */
    const opdh = await kioskService.insertOPD_H(patient)
    // save log
    queueLogger.info({
      process: `2.[${LOGNAME}]`,
      state: `[insertOPD_H]`,
      data: utils.trimValue(opdh)
    })
    job.progress(10)

    /* ########## STEP 2 ########## */
    const updatePatient = await kioskService.updatePATIENT(patient.hn, "O")
    // save log
    queueLogger.info({
      process: `3.[${LOGNAME}]`,
      state: `[updatePATIENT]`,
      data: utils.trimValue(updatePatient)
    })
    let jobResponse = job.data
    job.progress(20)

    if (opdh) {
      /* ########## STEP 3 ########## */
      const deptqd = await kioskService.insertDeptq_d(patient, opdh, hmain)
      // save log
      queueLogger.info({
        process: `4.[${LOGNAME}]`,
        state: `[insertDeptq_d]`,
        result: utils.trimValue(deptqd)
      })
      job.progress(30)

      /* ########## STEP 4 ########## */
      const visitRight = await kioskService.insertVisitRight(patient, opdh, hmain, get(pay_type, ["payType"], ""))
      // save log
      queueLogger.info({
        process: `5.[${LOGNAME}]`,
        state: `[insertVisitRight]`,
        result: utils.trimValue(visitRight)
      })
      job.progress(40)

      /* ########## STEP 5 ########## */
      const conEmp = await kioskService.insertCon_emp(patient, hmain, hsub, get(pay_type, ["payType"], ""))
      // save log
      queueLogger.info({
        process: `6.[${LOGNAME}]`,
        state: `[insertCon_emp]`,
        result: utils.trimValue(conEmp)
      })
      job.progress(50)

      /* ########## STEP 6 ########## */
      const Bill_h = await kioskService.insertBill_h(patient, opdh.regNo, hmain, hsub, get(pay_type, ["payType"], ""))
      // save log
      queueLogger.info({
        process: `7.[${LOGNAME}]`,
        state: `[insertBill_h]`,
        result: utils.trimValue(Bill_h)
      })
      job.progress(60)

      // add queue
      // checkDuplicateRxNoQueue.add({ patient: patient, ophh_data: opdh }, { delay: 5000 })

      await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("delay")
        }, 5000)
      })
      job.progress(70)

      /* ########## STEP 7 ########## */
      const checkDupRxNo = await kioskService.checkDupRxNo(patient, opdh)
      // save log
      queueLogger.info({
        process: `8.[${LOGNAME}]`,
        state: `[checkDupRxNo]`,
        result: utils.trimValue(Bill_h)
      })
      job.progress(80)

      jobResponse = {
        insertDeptq_d: utils.trimValue(deptqd),
        insertVisitRight: utils.trimValue(visitRight),
        insertCon_emp: utils.trimValue(conEmp),
        insertBill_h: utils.trimValue(Bill_h),
        checkDupRxNo: utils.trimValue(checkDupRxNo)
      }
    }
    const ms = Date.now() - start
    console.log("end process:", `${ms}ms`)
    // save log
    queueLogger.info({
      process: `9.[${LOGNAME}]`,
      state: `[end process]`,
      time: `${ms}ms`
    })
    return Promise.resolve(jobResponse)
  } catch (error) {
    // save log
    queueLogger.info({
      process: `10.[${LOGNAME}]`,
      state: `[error]`,
      error: error
    })
    return Promise.reject(error)
  }
}

module.exports = async job => {
  job.progress(0)
  // run worker
  const result = await worker(job)
  job.progress(100)
  // return data
  return Promise.resolve(result)
}
