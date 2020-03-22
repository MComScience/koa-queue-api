"use strict"

const redisClient = require("../connections/redis")
const { RateLimiterRedis } = require("rate-limiter-flexible")

const rateLimiter = new RateLimiterRedis({
  redis: redisClient,
  keyPrefix: "koa-rate-limiter",
  points: 100, // 100 requests for ctx.ip
  duration: 60 // per 60 second
})

module.exports = async (ctx, next) => {
  try {
    await rateLimiter.consume(ctx.ip)
    await next()
  } catch (error) {
    ctx.status = 429
    ctx.body = {
      statusCode: 429,
      error: "Too Many Requests",
      message: "Rate limit exceeded, retry in 1 minute"
    }
  }
}
