"use strict"

const line = require("../lib/line")
const secure_compare = require("secure-compare")
const request = require("request")
const jwt = require("jsonwebtoken")

let Promise = require("bluebird")
Promise.promisifyAll(request)

exports.login = line.auth()

exports.callback = async (ctx, next) => {
  try {
    if (ctx.session.line_session) return ctx.redirect("/")
    const code = ctx.request.query.code
    const state = ctx.request.query.state
    const friendship_status_changed = ctx.request.query.friendship_status_changed
    ctx.assert(code, 400, "Authorization failed.")
    ctx.assert(secure_compare(ctx.session.line_login_state, state), 400, "Authorization failed. State does not match.")
    const res = await request.postAsync({
      url: "https://api.line.me/oauth2/v2.1/token",
      form: {
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.LINE_LOGIN_CALLBACK_URL,
        client_id: process.env.LINE_LOGIN_CHANNEL_ID,
        client_secret: process.env.LINE_LOGIN_CHANNEL_SECRET
      }
    })
    if (res.statusCode === 200) {
      let body = JSON.parse(res.body)
      let decoded
      if (ctx.line.verify_id_token && body.id_token) {
        decoded = jwt.verify(body.id_token, process.env.LINE_LOGIN_CHANNEL_SECRET, {
          audience: process.env.LINE_LOGIN_CHANNEL_ID,
          issuer: "https://access.line.me",
          algorithms: ["HS256"]
        })
        ctx.assert(secure_compare(decoded.nonce, ctx.session.line_login_nonce), 400, "Nonce does not match.")
        body.id_token = decoded
      }
      ctx.session.line_session = body
      ctx.body = body
    } else {
      ctx.status = 400
      ctx.body = JSON.parse(res.body)
    }
  } catch (error) {
    ctx.throw(400, error)
  }
}
