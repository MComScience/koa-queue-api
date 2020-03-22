"use strict"

const Router = require("koa-router")
const authenticateJwt = require("../../../middlewares/authenticate-jwt")
const displayController = require("../../../controllers/display.controller")

const END_POINT = `/v1/display`
const router = new Router({
  prefix: END_POINT
})

// ex. /v1/display/display-list
router.get("/display-list", authenticateJwt, displayController.getDisplayListHandler)

// ex. /v1/display/get-display?id={id}
router.get("/display", authenticateJwt, displayController.getDisplayHandler)

// ex. /v1/display/queue-display-today?service_ids={array}&counter_service_ids={array}
router.get("/queue-display-today", authenticateJwt, displayController.getQueueDisplayToday)

router.get("/display-medicine", authenticateJwt, displayController.getDisplayMedicine)

router.get("/display-times-medicine", authenticateJwt, displayController.getDisplayTimesMedicine)

module.exports = router
