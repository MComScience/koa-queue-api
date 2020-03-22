"use strict"

const passport = require("koa-passport")
const passportJWT = require("passport-jwt")
const OAuthUsersModel = require("../models/oauth-users")
const AuthService = require("../services/auth.service")
const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  issuer: process.env.JWT_ISSUER,
  jsonWebTokenOptions: {
    algorithm: process.env.JWT_ALGORITHM,
    notBefore: process.env.JWT_NOTBEFORE,
    expiresIn: process.env.JWT_EXPIRESIN,
    issuer: process.env.JWT_ISSUER
  }
}

module.exports = async db => {
  const db_queue = await db
  const authService = new AuthService({ db_queue: db_queue })
  const jwtAuth = new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
    // console.log("[jwt_payload received]: ", jwt_payload)
    // usually this would be a database call:
    const user = await authService.findByUsernameOrEmail(jwt_payload.data)
    // OAuthUsersModel.findById(parseInt(jwt_payload.sub)) // users.find(u => u.id === parseInt(jwt_payload.sub));
    if (user) {
      done(null, user)
    } else {
      done(null, false)
    }
  })

  passport.use(jwtAuth)
}
