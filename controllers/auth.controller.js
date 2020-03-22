"use strict"

const yup = require("yup")
const AuthService = require("../services/auth.service")
const jwt = require("jsonwebtoken")
const { getCurrentDate } = require("../utils")
const crypto = require("crypto")
const randomBytes = require("bluebird").promisify(require("crypto").randomBytes)
const moment = require("moment")
const bcrypt = require("bcryptjs")
moment.locale("th")

/**
 * @method POST
 * @param {string} username The username of the user.
 * @param {string} password The username of the user.
 */
exports.login = async (ctx, next) => {
  try {
    const db_queue = ctx.db_queue
    const { username, password } = ctx.request.body
    ctx.assert(username, 400, "ชื่อผู้ใช้ต้องไม่ว่างเปล่า")
    ctx.assert(password, 400, "รหัสผ่านต้องไม่ว่างเปล่า")
    let schema = yup.object().shape({
      username: yup
        .string()
        .min(3)
        .matches(/^[-a-zA-Z0-9_\.@]+$/, { message: "ชื่อผู้ใช้ไม่ถูกต้อง" })
        .required(),
      password: yup
        .string()
        .min(6)
        .matches(/^[a-zA-Z0-9]{3,30}$/, { message: "รหัสผ่านไม่ถูกต้อง" })
        .required()
    })
    const values = await schema.validate({ username: username, password: password })
    const authService = new AuthService({ db_queue: db_queue })
    const user = await authService.findByUsernameOrEmail(values)
    ctx.assert(user, 422, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง.")
    ctx.assert(!user.blocked_at, 422, "บัญชีของคุณถูกบล็อค.")
    const isMatchPassword = bcrypt.compareSync(password, user.password_hash)
    ctx.assert(isMatchPassword, 422, "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง.")
    // sign data
    const payload = {
      data: authService.publicFields(user),
      jti: user.id
    }
    // get token in redis
    const userToken = await ctx.redis.getAsync(`_user_token_${user.id}`)
    let isExpired = false
    if (userToken) {
      const dataToken = JSON.parse(userToken)
      const decoded = await new Promise(resolve => {
        jwt.verify(dataToken.access_token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) isExpired = true
          resolve(decoded)
        })
      })
      if (!isExpired) {
        await authService.updateLastLogin(user.id, moment(getCurrentDate()).format("X"))
        return (ctx.body = {
          access_token: dataToken.access_token,
          expires_in: decoded.exp,
          user: authService.publicFields(user)
        })
      }
    }
    const access_token = await jwt.sign(payload, process.env.JWT_SECRET, {
      algorithm: process.env.JWT_ALGORITHM,
      notBefore: process.env.JWT_NOTBEFORE,
      expiresIn: process.env.JWT_EXPIRESIN,
      issuer: process.env.JWT_ISSUER,
      audience: String(user.id).toLowerCase(),
      subject: String(user.id).toLowerCase()
    })
    // expiresIn
    const date = getCurrentDate()
    date.setHours(date.getHours() + parseInt(process.env.JWT_EXPIRESIN.replace(/^\D+/g, ""))) // 24 hours
    // update time login
    await authService.updateLastLogin(user.id, moment().format("X"))
    // save session
    ctx.redis.set(
      `_user_token_${user.id}`,
      JSON.stringify({ userId: user.id, access_token: access_token }),
      "EX",
      60 * 60 * 24 // 24 ชม.
    )
    // const decoded = jwt.verify(access_token, process.env.JWT_SECRET)
    ctx.body = {
      access_token: access_token,
      user: authService.publicFields(user),
      expires_in: parseFloat(moment(date).format("X")) //decoded.exp
    }
  } catch (error) {
    ctx.throw(400, error)
  }
}

exports.generateRandomToken = () => {
  return randomBytes(256).then(function(buffer) {
    return crypto
      .createHash("sha1")
      .update(buffer)
      .digest("hex")
  })
}
