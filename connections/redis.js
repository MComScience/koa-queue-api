"use strict"

const redis = require("redis")
require("bluebird").promisifyAll(redis.RedisClient.prototype)
// create client
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  db: process.env.REDIS_DB,
  enable_offline_queue: false
})

client.on("connect", () => {
  console.log("Redis connected.")
})
client.on("error", error => {
  console.log("Redis error: ", error)
})
client.on("close", () => {
  console.log("Redis close.")
})

module.exports = client
