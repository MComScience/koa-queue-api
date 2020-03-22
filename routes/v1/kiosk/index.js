"use strict"

const Router = require("koa-router")
const kioskController = require("../../../controllers/kiosk.controller")
const authenticateJwt = require("../../../middlewares/authenticate-jwt")

const router = new Router({
  prefix: "/v1/kiosk"
})

// ex. /v1/kiosk/pt-profile/526592/2020-02-01
router.get("/pt-profile/:q/:date", authenticateJwt, kioskController.getPatientProfile)

// ex. /v1/kiosk/visit-last-dept?q=1696546&regisDate=25620315
router.get("/visit-last-dept", authenticateJwt, kioskController.getVisitLastDept)

// ex. /v1/kiosk/get-pt-profile?q=729187
router.get("/get-pt-profile", authenticateJwt, kioskController.getPtProfile)

// ex. /v1/kiosk/pt-right/1234567890123
router.get("/pt-right/:cid", authenticateJwt, kioskController.getPtRight)

router.post("/patient-visit", authenticateJwt, kioskController.savePatientVisit)

// ex. /v1/kiosk/search-patient/1234567890123
router.get("/search-patient/:q", authenticateJwt, kioskController.searchPatientHandler)

router.get("/departments", authenticateJwt, kioskController.getDepartments)

router.get("/kiosk-option", authenticateJwt, kioskController.getKoioskOptions)

router.get("/kiosk-list", kioskController.getKioskList)

router.get("/led-display-settings", kioskController.getLEDDisplaySettings)

router.get("/department-medicine", authenticateJwt, kioskController.getDepartmentMedicine)

router.get("/:id", kioskController.getKioskById)

module.exports = router
