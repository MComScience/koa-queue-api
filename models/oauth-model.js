"use strict"

/* const OAuthClientsModel = require("./oauth-clients")
const OAuthAuthorizationCodeModel = require("./oauth-authorization-code")
const OAuthUsersModel = require("./oauth-users")
const OAuthTokensModel = require("./oauth-tokens") */
const is = require("oauth2-server/lib/validator/is")
const InvalidRequestError = require("oauth2-server/lib/errors/invalid-request-error")
const get = require("lodash/get")
const moment = require("moment")
const jwt = require("jsonwebtoken")
moment.locale("th")
const Oauth2Service = require("../services/oauth2.service")
const { db_queue } = require("../connections")

const TOKEN_TYPE = "Bearer"

/**
 * Get the client from the model.
 */

module.exports.getClient = async (clientId, clientSecret) => {
  console.log("[getClient]", {
    clientId: clientId,
    clientSecret: clientSecret
  })
  const query = {
    client_id: clientId
  }
  if (clientSecret) {
    query.client_secret = clientSecret
  }

  const oauth2Service = new Oauth2Service({ db: db_queue })

  const client = await oauth2Service.getClient(query) // OAuthClientsModel.getClient(query)
  let result = null
  if (client) {
    result = {
      clientSecret: client.client_secret,
      grants: client.grant_types ? client.grant_types.split(",") : [],
      id: client.id,
      userId: client.user_id,
      redirectUris: client.redirect_uri,
      scopes: client.scopes ? client.scopes.split(",") : []
    }
  }

  return new Promise(function(resolve) {
    resolve(result)
  })
}

/**
 * Save authorization code.
 */

module.exports.saveAuthorizationCode = async (code, client, user) => {
  console.log("[saveAuthorizationCode]", code)
  console.log("[saveAuthorizationCode]", client)

  const oauth2Service = new Oauth2Service({ db: db_queue })
  await oauth2Service.revokeAuthorizationCode({ user_id: user.id, client_id: client.id })
  // await OAuthAuthorizationCodeModel.revokeAuthorizationCode({ user_id: user.userId, client_id: client.id })

  const authorizationCode = {
    authorization_code: code.authorizationCode,
    expires_at: code.expiresAt,
    scope: code.scope,
    client_id: client.id,
    user_id: user.id,
    redirect_uri: code.redirectUri
  }
  const AuthorizationCodeId = await oauth2Service.saveAuthorizationCode(authorizationCode)
  let authorization = await oauth2Service.getAuthorizationCode({ id: AuthorizationCodeId })

  authorization = Object.assign(authorization, {
    authorizationCode: code.authorizationCode,
    expiresAt: code.expiresAt,
    scope: code.scope,
    userId: user.id,
    redirectUri: code.redirectUri
  })

  return Promise.resolve(authorization)
  // const modelAuthorizationCode = new OAuthAuthorizationCodeModel(authorizationCode)
  // return new Promise(function(resolve, reject) {
  //   modelAuthorizationCode.save(function(err, data) {
  //     if (err) throw err
  //     resolve(data)
  //   })
  // })
}

/**
 * Get the authorization code.
 */

module.exports.getAuthorizationCode = async authorizationCode => {
  console.log("[getAuthorizationCode]", authorizationCode)

  const oauth2Service = new Oauth2Service({ db: db_queue })

  const authCode = await oauth2Service.getAuthorizationCode({ authorization_code: authorizationCode }) // OAuthAuthorizationCodeModel.getAuthorizationCode(authorizationCode)
  if (!authCode) {
    return null
  }
  const user = await oauth2Service.getUser({ id: authCode.user_id }) // OAuthUsersModel.findById(authCode.userId)
  if (!user) {
    return null
  }
  const client = await oauth2Service.getClient({ id: authCode.client_id })
  const result = {
    authorizationCode: authCode.authorization_code,
    expiresAt: authCode.expires_at,
    redirectUri: authCode.redirect_uri,
    scope: authCode.scope,
    client: client,
    user: user
  }
  console.log(result)
  return new Promise((resolve, reject) => {
    resolve(result)
  })
}

/**
 * Revoke the authorization code.
 *
 * "The authorization code MUST expire shortly after it is issued to mitigate
 * the risk of leaks. [...] If an authorization code is used more than once,
 * the authorization server MUST deny the request."
 *
 * @see https://tools.ietf.org/html/rfc6749#section-4.1.2
 */

module.exports.revokeAuthorizationCode = async code => {
  console.log("[revokeAuthorizationCode]", code)
  const oauth2Service = new Oauth2Service({ db: db_queue })
  await oauth2Service.revokeAuthorizationCode({
    authorization_code: code.authorizationCode,
    client_id: code.client.id,
    user_id: code.user.id
  }) // OAuthAuthorizationCodeModel.revokeAuthorizationCode({ userId: code.userId, clientId: code.client.id })
  const codeWasFoundAndDeleted = true // Return true if code found and deleted, false otherwise
  return new Promise(resolve => {
    resolve(codeWasFoundAndDeleted)
  })
}

/**
 * Generate access token.
 */

module.exports.generateAccessToken = (client, user, scope) => {
  console.log("[generateAccessToken]", {
    client: client,
    user: user,
    scope: scope
  })
  const scopes = scope ? scope.split(",") : []
  let payload = {
    amr: ["sso"],
    name: user.name,
    jti: user.id
  }
  if (scopes.includes("email")) {
    payload = Object.assign(payload, {
      email: user.email
    })
  }
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: process.env.JWT_ALGORITHM,
    notBefore: process.env.JWT_NOTBEFORE,
    expiresIn: process.env.JWT_EXPIRESIN, // 60 * 60 * 24, // '10h',
    audience: String(client.id).toLowerCase(),
    issuer: process.env.JWT_ISSUER,
    subject: String(user.id).toLowerCase()
  })
  return token
}

/**
 * Save token.
 */

module.exports.saveToken = async (token, client, user) => {
  console.log("[saveToken]", {
    token: token,
    client: client,
    user: user
  })
  const oauth2Service = new Oauth2Service({ db: db_queue })
  if (token.authorizationCode) {
    await oauth2Service.revokeAuthorizationCode({ authorization_code: token.authorizationCode })
  }
  await oauth2Service.revokeToken({ user_id: user.id, client_id: client.id })
  /* OAuthAuthorizationCodeModel.deleteOne({
    authorizationCode: token.authorizationCode
  }) */
  // await OAuthTokensModel.deleteMany({ userId: user.userId, clientId: client.id })
  /* const modelTokens = new OAuthTokensModel({
    accessToken: token.accessToken,
    accessTokenExpiresAt: token.accessTokenExpiresAt,
    clientId: client.id,
    refreshToken: token.refreshToken,
    refreshTokenExpiresAt: token.refreshTokenExpiresAt,
    userId: user.id,
    scope: token.scope
  }) */
  const tokenId = await oauth2Service.saveToken({
    access_token: token.accessToken,
    access_token_expires_at: token.accessTokenExpiresAt,
    client_id: client.id,
    user_id: user.id,
    scope: token.scope,
    refresh_token: token.refreshToken,
    refresh_token_expires_at: token.refreshTokenExpiresAt
  })
  const oAuthTokens = await oauth2Service.getToken({ id: tokenId })

  /* const inserted = await new Promise(function(resolve, reject) {
    modelTokens.save(function(err, data) {
      if (err) throw err
      resolve(data)
    })
  })
 */
  let result

  if (oAuthTokens) {
    result = {
      expires_in: parseInt(moment(token.accessTokenExpiresAt).format("X")),
      refresh_token: token.refreshToken,
      scope: token.scope,
      token_type: TOKEN_TYPE,
      accessToken: token.accessToken,
      accessTokenExpiresAt: token.accessTokenExpiresAt,
      client: client,
      refreshToken: token.refreshToken,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      user: user
    }
  }
  return result
}

/**
 * Revoke the refresh token.
 *
 * @see https://tools.ietf.org/html/rfc6749#section-6
 */

module.exports.revokeToken = async token => {
  console.log("[revokeToken]", token)
  const oauth2Service = new Oauth2Service({ db: db_queue })
  const result = await oauth2Service.revokeToken({ refresh_token: token.refreshToken })
  /* const result = await OAuthTokensModel.deleteOne({
    refreshToken: token.refreshToken
  }) */

  return result
}

/**
 * Get refresh token.
 */
module.exports.getRefreshToken = async refreshToken => {
  console.log("[getRefreshToken]", refreshToken)

  const oauth2Service = new Oauth2Service({ db: db_queue })
  const token = await oauth2Service.getRefreshToken(refreshToken) // OAuthTokensModel.findRefreshToken(refreshToken)

  if (!token) return false

  const user = await oauth2Service.getUser({ id: token.user_id }) // OAuthUsersModel.findById(token.userId)
  const client = await oauth2Service.getClient({ id: token.client_id })

  return {
    refreshToken: token.refresh_token,
    client: client,
    user: user,
    scope: token.scope
  }
}

module.exports.getAccessToken = async accessToken => {
  console.log("[getAccessToken]", accessToken)
  const oauth2Service = new Oauth2Service({ db: db_queue })

  const token = await oauth2Service.getAccessToken(accessToken) // OAuthTokensModel.findAccessToken({ accessToken })

  let result

  if (token) {
    const user = await oauth2Service.getUser({ id: token.user_id })
    const client = await oauth2Service.getClient({ id: token.client_id })
    result = {
      accessToken: token.access_token,
      accessTokenExpiresAt: token.access_token_expires_at,
      client: client,
      expires: token.access_token_expires_at,
      user: user
    }
  }

  return result
}

// list of valid scopes
// const VALID_SCOPES = ["profile", "email"]

module.exports.validateScope = (user, client, scope) => {
  console.log("[validateScope]", scope)
  const VALID_SCOPES = client.scopes || []
  if (!scope.split(",").every(s => VALID_SCOPES.indexOf(s) >= 0)) {
    return false
  }
  return scope
}

module.exports.verifyScope = (token, scope) => {
  console.log("[verifyScope]", token)

  if (!token.scope) {
    return false
  }
  let requestedScopes = scope.split(" ")
  let authorizedScopes = token.scope.split(" ")
  const userHasAccess = requestedScopes.every(s => authorizedScopes.indexOf(s) >= 0) // return true if this user / client combo has access to this resource
  return userHasAccess
}

/**
 * Get state from the request.
 */

module.exports.getState = request => {
  const state = get(request.body, ["state"]) || get(request.query, ["state"])

  if (!get(request.oauth.options, ["allowEmptyState"]) && !state) {
    throw new InvalidRequestError("Missing parameter: `state`")
  }

  if (!is.vschar(state)) {
    throw new InvalidRequestError("Invalid parameter: `state`")
  }

  return state
}
