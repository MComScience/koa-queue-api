"use strict"

const Router = require("koa-router")
const authenticateJwt = require("../../../middlewares/authenticate-jwt")
const appointmentController = require("../../../controllers/appointment.controller")

const router = new Router({
  prefix: "/v1/appointment"
})

router.get("/form-options", authenticateJwt, appointmentController.formOptionsHandler)

router.get("/appoint-data-of-doctor", authenticateJwt, appointmentController.appointDataOfDoctor)

router.get("/appoint-data-of-patient", authenticateJwt, appointmentController.appointDataOfPatient)

router.get("/search-patient", authenticateJwt, appointmentController.searchPatientHandler)

router.get("/search-med-schedule", authenticateJwt, appointmentController.searchMedScheduleHandler)

router.put("/save-appoint", authenticateJwt, appointmentController.saveAppointHandler)

router.post("/save-appoint", authenticateJwt, appointmentController.saveAppointHandler)

router.get("/update-appoint", authenticateJwt, appointmentController.updateAppointHandler)

router.put("/save-holiday", authenticateJwt, appointmentController.saveHolidayHandler)

router.post("/save-holiday", authenticateJwt, appointmentController.saveHolidayHandler)

router.get("/calendar-events", authenticateJwt, appointmentController.calendarEventsHandler)

router.delete("/delete-holiday", authenticateJwt, appointmentController.deleteHolidayHandler)

router.delete("/delete-appoint", authenticateJwt, appointmentController.deleteAppointHandler)

module.exports = router
