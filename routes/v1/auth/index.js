"use strict"

const Router = require("koa-router")
const authController = require("../../../controllers/auth.controller")

const router = new Router({
  prefix: "/v1/auth"
})

router.post("/login", authController.login)

module.exports = router
