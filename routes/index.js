"use strict"

const Router = require("koa-router")
const OAuthTokensModel = require("../models/oauth-tokens")
const authenticateJwt = require("../middlewares/authenticate-jwt")
const jwt = require("jsonwebtoken")
const router = new Router()
const path = require("path")
const fs = require("fs")
const sharp = require("sharp")
const uuid = require("uuid")

router.get("/", (ctx, next) => {
  ctx.body = {
    status: "ok",
    line_session: ctx.session.line_session
  }
})

router.post("/upload", async (ctx, next) => {
  try {
    const file = ctx.request.files.avatar
    const readStream = fs.createReadStream(file.path)

    const extension = file.type.split("/")[1]
    let fileName = `${uuid.v4()}.${extension}`

    const writeStream = fs.createWriteStream(path.join(__dirname, "..", "public", "uploads", fileName), { flags: "w" })
    readStream.pipe(writeStream)

    sharp(readStream.path)
      .resize({
        width: 250,
        height: 250
      })
      .toFile(path.join(__dirname, "..", "public", "uploads", fileName))

    ctx.body = file
  } catch (error) {
    ctx.throw(error)
  }
})

router.get("/login", async (ctx, next) => {
  const payload = { name: "tanakorn" }
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: process.env.JWT_ALGORITHM,
    notBefore: process.env.JWT_NOTBEFORE,
    expiresIn: process.env.JWT_EXPIRESIN,
    issuer: process.env.JWT_ISSUER,
    audience: String(1).toLowerCase(),
    subject: String(1).toLowerCase()
  })
  await next()
  ctx.body = {
    token: token
  }
})

router.get("/user", authenticateJwt, async ctx => {
  const tokens = await OAuthTokensModel.findAccessToken({
    clientId: "myClientId",
    accessToken:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhbXIiOlsic3NvIl0sImp0aSI6MiwiaWF0IjoxNTgyOTY0NDM2LCJuYmYiOjE1ODI5NjQ0MzYsImV4cCI6MTU4Mjk2NDczNiwiYXVkIjoibXlDbGllbnRJZCIsImlzcyI6Imh0dHA6Ly8xMjcuMC4wLjE6ODA4MiIsInN1YiI6IjIifQ.45XpDKwEM13pjSXMaskERjRnVwW6EhcSnTqvZqvHP78"
  })
  ctx.body = {
    user: ctx.session.user,
    data: tokens
  }
})

router.get("/right", async (ctx, next) => {
  try {
    const args = {
      user_person_id: 3419900635231,
      smctoken: "hebgb99hri39226j",
      person_id: String("3101201490662").replace(/ /g, "")
    }
    const soapClient = await ctx.soapClient
    const right = await soapClient.searchCurrentByPIDAsync(args)
    ctx.assert(right && right[0], 400)
    ctx.body = right
  } catch (error) {
    ctx.throw(error)
  }
})

module.exports = router
