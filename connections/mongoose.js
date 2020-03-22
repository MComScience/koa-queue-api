"use strict"

const mongoose = require("mongoose")

const connString = process.env.MONGODB_CONNECTION_STRING

mongoose.connect(connString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

const db = mongoose.connection

db.on("connected", function() {
  console.log("Mongoose default connection open to " + connString)
})

db.on("error", function(err) {
  console.log("Mongoose default connection error: " + err)
})

db.on("disconnected", function() {
  console.log("Mongoose default connection disconnected")
})

process.on("SIGINT", function() {
  db.close(function() {
    console.log("Mongoose default connection closed through app termination")
    process.exit(0)
  })
})

module.exports = db
