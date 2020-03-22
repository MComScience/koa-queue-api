"use strict"

const mongoose = require("mongoose")
const Schema = mongoose.Schema

/**
 * Schema definitions.
 */

const OAuthAuthorizationCode = new Schema(
  {
    authorizationCode: { type: String },
    expiresAt: { type: Date },
    scope: { type: String },
    clientId: { type: String },
    redirectUri: { type: String },
    userId: { type: Number }
  },
  { autoCreate: true }
)

OAuthAuthorizationCode.statics.getAuthorizationCode = function(authorizationCode) {
  return this.findOne({ authorizationCode: authorizationCode })
}

OAuthAuthorizationCode.statics.revokeAuthorizationCode = function(conditions) {
  return this.deleteMany(conditions)
}

const model = mongoose.model("OAuthAuthorizationCode", OAuthAuthorizationCode)

module.exports = model
