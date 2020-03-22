"use strict"

const Router = require("koa-router")
const authenticateJwt = require("../../../middlewares/authenticate-jwt")
const queueController = require("../../../controllers/queue.controller")

const END_POINT = `/v1/queue`
const router = new Router({
  prefix: END_POINT
})

router.get("/queue-today", authenticateJwt, queueController.getQueueToday)

// ex. /v1/queue/data-wait-history?service_ids=1,2,3,6,11,13,95&service_type_id=1
router.get("/data-wait-history", authenticateJwt, queueController.getDataWaitHistory)

// ex. /v1/queue/data-wait-history-by-id?service_ids=1,2,3,6,11,13,95&service_type_id=1&queue_detail_id=1
router.get("/data-wait-history-by-id", authenticateJwt, queueController.getDataWaitHistoryById)

// ex. /v1/queue/data-call-history?service_ids=1,2,3,6,11,13,95&service_type_id=1&counter_service_id=1
router.get("/data-call-history", authenticateJwt, queueController.getDataCallHistory)

// ex. /v1/queue/data-call-history-by-id?service_ids=1,2,3,6,11,13,95&service_type_id=1&counter_service_id=1&=caller_id=1
router.get("/data-call-history-by-id", authenticateJwt, queueController.getDataCallHistoryById)

// ex. /v1/queue/data-hold-history?service_ids=1,2,3,6,11,13,95&service_type_id=1&counter_service_id=1
router.get("/data-hold-history", authenticateJwt, queueController.getDataHoldHistory)

// ex. /v1/queue/data-hold-history-by-id?service_ids=1,2,3,6,11,13,95&service_type_id=1&counter_service_id=1&=caller_id=1
router.get("/data-hold-history-by-id", authenticateJwt, queueController.getDataHoldHistoryById)

// ex. /v1/queue/data-end-history?service_ids=1,2,3,6,11,13,95&service_type_id=1&counter_service_id=1
router.get("/data-end-history", authenticateJwt, queueController.getDataEndHistory)

// ex. /v1/queue/data-wait-examination?service_ids=1,2,3,6,11,13,95&service_type_id=2&counter_service_id=1
router.get("/data-wait-examination", authenticateJwt, queueController.getDataWaitExamination)

// ex. /v1/queue/data-wait-examination-by-id?service_ids=1,2,3,6,11,13,95&service_type_id=2&counter_service_id=1&queue_detail_id=1
router.get("/data-wait-examination-by-id", authenticateJwt, queueController.getDataWaitExaminationById)

// ex. /v1/queue/data-call-examination?service_ids=1,2,3,6,11,13,95&service_type_id=2&counter_service_id=1
router.get("/data-call-examination", authenticateJwt, queueController.getDataCallExamination)

// ex. /v1/queue/data-call-examination?service_ids=1,2,3,6,11,13,95&service_type_id=2&counter_service_id=1&=caller_id=1
router.get("/data-call-examination-by-id", authenticateJwt, queueController.getDataCallExaminationById)

// ex. /v1/queue/data-hold-examination?service_ids=1,2,3,6,11,13,95&service_type_id=2&counter_service_id=1
router.get("/data-hold-examination", authenticateJwt, queueController.getDataHoldExamination)

// ex. /v1/queue/data-hold-examination-by-id?service_ids=1,2,3,6,11,13,95&service_type_id=2&counter_service_id=1&=caller_id=1
router.get("/data-hold-examination-by-id", authenticateJwt, queueController.getDataHoldExaminationById)

// ex. /v1/queue/data-wait-medicine?service_ids=1,2,3,6,11,13,95&service_type_id=3
router.get("/data-wait-medicine", authenticateJwt, queueController.getDataWaitMedicine)

// ex. /v1/queue/data-wait-medicine-by-id?service_ids=1,2,3,6,11,13,95&service_type_id=3&queue_detail_id=1
router.get("/data-wait-medicine-by-id", authenticateJwt, queueController.getDataWaitMedicineById)

// ex. /v1/queue/data-call-medicine?service_ids=1,2,3,6,11,13,95&service_type_id=3&counter_service_id=1
router.get("/data-call-medicine", authenticateJwt, queueController.getDataCallMedicine)

// ex. /v1/queue/data-call-medicine-by-id?service_ids=1,2,3,6,11,13,95&service_type_id=3&counter_service_id=1&caller_id=1
router.get("/data-call-medicine-by-id", authenticateJwt, queueController.getDataCallMedicineById)

// ex. /v1/queue/data-hold-medicine?service_ids=1,2,3,6,11,13,95&service_type_id=3&counter_service_id=1
router.get("/data-hold-medicine", authenticateJwt, queueController.getDataHoldMedicine)

// ex. /v1/queue/data-hold-medicine-by-id?service_ids=1,2,3,6,11,13,95&service_type_id=3&counter_service_id=1&caller_id=1
router.get("/data-hold-medicine-by-id", authenticateJwt, queueController.getDataHoldMedicineById)

// ex. /v1/queue/1
router.delete("/:id", authenticateJwt, queueController.deleteQueueHandler)

// ex. /v1/queue/update-patient
router.post("/update-patient", authenticateJwt, queueController.updatePatientHandler)

// ex. /v1/queue/update-request-failed
router.put("/update-request-failed", authenticateJwt, queueController.updateRequestFailed)

// ex. /v1/queue/data-queue-list?startDate=2020-03-01&endDate=2020-03-01
router.get("/data-queue-list", authenticateJwt, queueController.getDataQueueList)

// ex. /v1/queue/data-queue-list-by-id?startDate=2020-03-01&endDate=2020-03-01&id=1
router.get("/data-queue-list-by-id", authenticateJwt, queueController.getDataQueueListById)

// ex. /v1/queue/data-update-option
router.get("/data-update-option", authenticateJwt, queueController.getUpdateDataOption)

// ex. /v1/queue/data-queue-ex-today?hn=123456
router.get("/data-queue-ex-today", authenticateJwt, queueController.getDataQueueExToday)

// ex. /v1/queue/search-patient?=q123456
router.get("/search-patient", authenticateJwt, queueController.searchPatientHandler)

// ex. /v1/queue/med-schedules-by-service?service_ids=1,2,3,6,11,13,95
router.get("/med-schedules-by-service", authenticateJwt, queueController.getMedSchedulesByService)

// ex. /v1/queue/player-options
router.get("/player-options", authenticateJwt, queueController.getPlayerOptions)

// ex. /v1/queue/update-status-call
router.post("/update-status-call", authenticateJwt, queueController.updateStatusCall)

// ex. /v1/queue/check-queue-examination?id=1
router.get("/check-queue-examination", authenticateJwt, queueController.checkQueueExamination)

// ex. /v1/queue/count-waiting-qrcode?service_id=1&service_type_id=1&queue_detail_id=1
router.get("/count-waiting-qrcode", authenticateJwt, queueController.countWaitingQrcode)

// ex. /v1/queue/call-wait
router.post("/call-wait", authenticateJwt, queueController.callWaitHandler)

// ex. /v1/queue/call-multiple-queue
router.post("/call-multiple-queue", authenticateJwt, queueController.callMultipleQueueHandler)

// ex. /v1/queue/end-wait
router.post("/end-wait", authenticateJwt, queueController.endWaitHandler)

// ex. /v1/queue/recall
router.post("/recall", authenticateJwt, queueController.recallHandler)

// ex. /v1/queue/hold
router.post("/hold", authenticateJwt, queueController.holdHandler)

// ex. /v1/queue/end
router.post("/end", authenticateJwt, queueController.endHandler)

// ex. /v1/queue/call-wait-examination
router.post("/call-wait-examination", authenticateJwt, queueController.callWaitExaminationHandler)

// ex. /v1/queue/call-multiple-queue-examination
router.post("/call-multiple-queue-examination", authenticateJwt, queueController.callMultipleQueueExamination)

// ex. /v1/queue/end-wait-examination
router.post("/end-wait-examination", authenticateJwt, queueController.endWaitExaminationHandler)

// ex. /v1/queue/recall-examination
router.post("/recall-examination", authenticateJwt, queueController.recallExaminationHandler)

// ex. /v1/queue/hold-examination
router.post("/hold-examination", authenticateJwt, queueController.holdExaminationHandler)

// ex. /v1/queue/end-examination
router.post("/end-examination", authenticateJwt, queueController.endExaminationHandler)

// ex. /v1/queue/call-wait-medicine
router.post("/call-wait-medicine", authenticateJwt, queueController.callWaitMedicineHandler)

// ex. /v1/queue/end-wait-medicine
router.post("/end-wait-medicine", authenticateJwt, queueController.endWaitMedicineHandler)

// ex. /v1/queue/problem-prescription-medicine
router.post("/problem-prescription-medicine", authenticateJwt, queueController.problemPrescriptionMedicine)

// ex. /v1/queue/recall-medicine
router.post("/recall-medicine", authenticateJwt, queueController.recallMedicineHandler)

// ex. /v1/queue/hold-medicine
router.post("/hold-medicine", authenticateJwt, queueController.holdMedicineHandler)

// ex. /v1/queue/end-medicine
router.post("/end-medicine", authenticateJwt, queueController.endMedicineHandler)

// ex. /v1/queue/register
router.post("/register", authenticateJwt, queueController.registerHanlder)

// ex. /v1/queue/register-examination
router.post("/register-examination", authenticateJwt, queueController.registerExaminationHandler)

// ex. /v1/queue/register-medicine
router.post("/register-medicine", authenticateJwt, queueController.registerMedicineHandler)

router.get("/qrcode/:id", authenticateJwt, queueController.getQrcode)

module.exports = router
