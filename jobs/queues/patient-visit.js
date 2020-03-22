"use strict"

const Queue = require("bull")
const jobProcess = require("../processor/save-patient")
const { queueLogger } = require("../../stream")
const utils = require("../../utils")

const Job = new Queue("savePatientVisit", {
  redis: { port: process.env.REDIS_PORT, host: process.env.REDIS_HOST, db: process.env.REDIS_DB }
})
const LOGNAME = "SavePatient"

Job.process(jobProcess)

Job.on("error", error => {
  // save log
  queueLogger.info({
    process: `[${LOGNAME}:ERROR]`,
    error: error
  })
  // console.log("[error]", error)
})

Job.on("waiting", async jobId => {
  // save log
  queueLogger.info({
    process: `[${LOGNAME}:WAITING]`,
    jobId: jobId
  })
})

Job.on("progress", (job, progress) => {
  // save log
  queueLogger.info({
    process: `[${LOGNAME}:PROGRESS]`,
    jobId: job.id,
    progress: progress
  })
  // console.log("[progress job]: ", job)
  // console.log("[progress]: ", progress)
})

Job.on("completed", async (job, result) => {
  const logs = await Job.getJobLogs(job.id)
  // save log
  queueLogger.info({
    process: `[${LOGNAME}:COMPLETED]`,
    jobId: job.id,
    logs: logs,
    result: utils.trimValue(result)
  })
  job.remove()
  // console.log(`[completed]: `, logs)
  // console.log(`[completed]: `, result)
})

Job.on("failed", (job, err) => {
  // save log
  queueLogger.info({
    process: `[${LOGNAME}:FAILED]`,
    jobId: job.id,
    err: err
  })
  // console.log("[failed job]: ", job)
  // console.log("[failed err]: ", err)
})

module.exports = Job
