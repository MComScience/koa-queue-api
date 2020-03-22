"use strict"

const passport = require("koa-passport")

module.exports = async (ctx, next) => {
  return passport.authenticate("jwt", async (err, user, info, status) => {
    if (!user || err) {
      let message = info.message
      if (message === "invalid signature") {
        message = "Your request was made with invalid credentials."
      }
      ctx.status = 401
      ctx.body = {
        statusCode: 401,
        name: "Unauthorized",
        message: message
      }
    } else {
      ctx.session.user = user
      await next()
    }
  })(ctx, next)
}
