"use strict"

const mongoose = require("mongoose")
const Schema = mongoose.Schema

/**
 * Schema definitions.
 */

const OAuthTokens = new Schema(
  {
    accessToken: { type: String },
    accessTokenExpiresAt: { type: Date },
    clientId: { type: String },
    refreshToken: { type: String },
    refreshTokenExpiresAt: { type: Date },
    scope: { type: String },
    userId: { type: Number }
  },
  { autoCreate: true }
)

OAuthTokens.statics.findAccessToken = function(conditions) {
  return this.findOne(conditions)
}

OAuthTokens.statics.findRefreshToken = function(refreshToken) {
  return this.findOne({ refreshToken: refreshToken })
}

OAuthTokens.statics.deleteToken = function(userId, clientId) {
  return this.deleteMany({ userId: userId, clientId: clientId })
}

OAuthTokens.statics.revokeToken = function(refreshToken) {
  return this.deleteOne({ refreshToken: refreshToken })
}

const model = mongoose.model("OAuthTokens", OAuthTokens)

module.exports = model
