"use strict"

const Router = require("koa-router")
const oauth2Controller = require("../../../controllers/oauth2.controller")

const router = new Router({
  prefix: "/v1/oauth2"
})

router.get("/authorize", oauth2Controller.authorize)

router.post("/authorize", oauth2Controller.authorize)

router.post("/token", oauth2Controller.token)

router.get("/verify", oauth2Controller.verifyAccessToken)

router.post("/verify", oauth2Controller.verifyIDToken)

router.post("/revoke", oauth2Controller.revoke)

router.get("/status", oauth2Controller.status)

router.get("/login", oauth2Controller.login)

router.post("/login", oauth2Controller.login)

router.get("/user", oauth2Controller.user)

router.get("/profile", oauth2Controller.getProfile)

module.exports = router
