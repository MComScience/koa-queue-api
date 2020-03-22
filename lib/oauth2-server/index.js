"use strict"

/**
 * Module dependencies.
 */

const InvalidArgumentError = require("oauth2-server/lib/errors/invalid-argument-error")
const OAuth2Server = require("oauth2-server")
const Request = require("oauth2-server").Request
const Response = require("oauth2-server").Response
const UnauthorizedRequestError = require("oauth2-server/lib/errors/unauthorized-request-error")
const co = require("co")

/**
 * Constructor.
 */

function KoaOAuthServer(options) {
  options = options || {}

  if (!options.model) {
    throw new InvalidArgumentError("Missing parameter: `model`")
  }

  for (var fn in options.model) {
    options.model[fn] = co.wrap(options.model[fn])
  }

  this.server = new OAuth2Server(options)
}

/**
 * Authentication Middleware.
 *
 * Returns a middleware that will validate a token.
 *
 * (See: https://tools.ietf.org/html/rfc6749#section-7)
 */

KoaOAuthServer.prototype.authenticate = function() {
  const server = this.server

  return async function(ctx, next) {
    const request = new Request(this.request)

    try {
      this.state.oauth = {
        token: await server.authenticate(request)
      }
    } catch (e) {
      return handleError.call(this, e)
    }

    await next()
  }
}

/**
 * Authorization Middleware.
 *
 * Returns a middleware that will authorize a client to request tokens.
 *
 * (See: https://tools.ietf.org/html/rfc6749#section-3.1)
 */

KoaOAuthServer.prototype.authorize = function() {
  const server = this.server

  return async function(ctx, next) {
    const request = new Request(this.request)
    const response = new Response(this.response)

    try {
      this.state.oauth = {
        code: await server.authorize(request, response)
      }

      handleResponse.call(this, response)
    } catch (e) {
      return handleError.call(this, e, response)
    }

    await next()
  }
}

/**
 * Grant Middleware
 *
 * Returns middleware that will grant tokens to valid requests.
 *
 * (See: https://tools.ietf.org/html/rfc6749#section-3.2)
 */

KoaOAuthServer.prototype.token = function() {
  const server = this.server

  return async function(ctx, next) {
    const request = new Request(this.request)
    const response = new Response(this.response)

    try {
      this.state.oauth = {
        token: await server.token(request, response)
      }

      handleResponse.call(this, response)
    } catch (e) {
      return handleError.call(this, e, response)
    }

    await next()
  }
}

/**
 * Handle error.
 */

var handleError = function(e, response) {
  if (response) {
    this.set(response.headers)
  }

  if (e instanceof UnauthorizedRequestError) {
    this.status = e.code
  } else {
    this.body = { error: e.name, error_description: e.message }
    this.status = e.code
  }

  return this.app.emit("error", e, this)
}

/**
 * Export constructor.
 */

module.exports = KoaOAuthServer
