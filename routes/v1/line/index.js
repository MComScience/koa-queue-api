"use strict"

const Router = require("koa-router")
const lineController = require("../../../controllers/line.controller")

const router = new Router({
  prefix: "/v1/line"
})

router.get("/login", lineController.login)

router.get("/callback", lineController.callback)

module.exports = router
