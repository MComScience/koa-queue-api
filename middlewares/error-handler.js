"use strict"

module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    // will only respond with JSON
    console.log(err.stack)
    const statusCode = err.statusCode || err.status || 500
    ctx.status = statusCode
    ctx.body = {
      statusCode: statusCode,
      name: err.name,
      message: err.message
      // error: err.stack
    }
  }
}
