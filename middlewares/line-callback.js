"use strict"

const secure_compare = require("secure-compare")

module.exports = async (ctx, next) => {
  try {
    const code = ctx.request.query.code
    const state = ctx.request.query.state
    const friendship_status_changed = ctx.request.query.friendship_status_changed
    ctx.assert(code, 400, "Authorization failed.")
    ctx.assert(secure_compare(ctx.session.line_login_state, state), 400, "Authorization failed. State does not match.")
    await next()
  } catch (error) {
    ctx.status = 401
    ctx.body = {
      statusCode: 401,
      error: "Unauthorized",
      message: error.message
    }
  }
}
