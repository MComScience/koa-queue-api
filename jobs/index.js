"use strict"

const { savePatientQueue, checkDuplicateRxNo } = require("./queues")

module.exports = {
  SavePatientQueue: savePatientQueue,
  CheckDuplicateRxNo: checkDuplicateRxNo
}
