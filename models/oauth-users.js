"use strict"

const mongoose = require("mongoose")
const Schema = mongoose.Schema

/**
 * Schema definitions.
 */

const OAuthUsers = new Schema(
  {
    userId: { type: Number },
    email: { type: String, default: "" },
    firstname: { type: String },
    lastname: { type: String },
    password: { type: String },
    username: { type: String },
    clients: { type: Array }
  },
  { autoCreate: true }
)

OAuthUsers.statics.findById = function(userId) {
  return this.findOne({ userId: userId })
}

const model = mongoose.model("OAuthUsers", OAuthUsers)

module.exports = model
