"use strict"

const mongoose = require("mongoose")
const Schema = mongoose.Schema

/**
 * Schema definitions.
 */

const OAuthClients = new Schema(
  {
    clientId: { type: String },
    clientSecret: { type: String },
    redirectUris: { type: Array },
    grantTypes: { type: Array },
    scopes: { type: Array },
    userId: { type: Number },
    name: { type: String }
  },
  { autoCreate: true }
)

OAuthClients.statics.getClient = function(conditions) {
  return this.findOne(conditions)
}

const model = mongoose.model("OAuthClients", OAuthClients)

module.exports = model
