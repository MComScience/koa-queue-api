"use strict"

const request = require("request")
const crypto = require("crypto")
const api_version = "v2.1"

let Promise = require("bluebird")
Promise.promisifyAll(request)

/**
@class
*/
class LineLogin {
  /**
    @constructor
    @param {Object} options
    @param {String} options.channel_id - LINE Channel Id
    @param {String} options.channel_secret - LINE Channel secret
    @param {String} options.callback_url - LINE Callback URL
    @param {String} [options.scope="profile openid"] - Permission to ask user to approve. Supported values are "profile", "openid" and "email". To specify email, you need to request approval to LINE.
    @param {String} [options.prompt] - Used to force the consent screen to be displayed even if the user has already granted all requested permissions. Supported value is "concent".
    @param {String} [options.bot_prompt="normal"] - Displays an option to add a bot as a friend during login. Set value to either normal or aggressive. Supported values are "normal" and "aggressive".
    @param {Boolean} [options.verify_id_token=true] - Used to verify id token in token response. Default is true.
    @param {String} [options.endpoint="line.me"] - Test purpose only. Change API endpoint hostname.
    */

  constructor(options) {
    const required_params = ["channel_id", "channel_secret", "callback_url"]
    const optional_params = ["scope", "prompt", "bot_prompt", "session_options", "verify_id_token", "endpoint"]

    // Check if required parameters are all set.
    required_params.map(param => {
      if (!options[param]) {
        throw new Error(`Required parameter ${param} is missing.`)
      }
    })

    // Check if configured parameters are all valid.
    Object.keys(options).map(param => {
      if (!required_params.includes(param) && !optional_params.includes(param)) {
        throw new Error(`${param} is not a valid parameter.`)
      }
    })

    this.channel_id = options.channel_id
    this.channel_secret = options.channel_secret
    this.callback_url = options.callback_url
    this.scope = options.scope || "profile openid"
    this.prompt = options.prompt
    this.bot_prompt = options.bot_prompt || "normal"
    if (typeof options.verify_id_token === "undefined") {
      this.verify_id_token = true
    } else {
      this.verify_id_token = options.verify_id_token
    }
    this.endpoint = options.endpoint || "line.me"
  }

  /**
    Middlware to initiate OAuth2 flow by redirecting user to LINE authorization endpoint.
    Mount this middleware to the path you like to initiate authorization.
    @method
    @return {Function}
    */
  auth() {
    return (ctx, next) => {
      let state = LineLogin._random()
      let nonce = LineLogin._random()
      ctx.session.line_login_state = state
      ctx.session.line_login_nonce = nonce
      let url = this.make_auth_url(state, nonce)
      ctx.redirect(url)
    }
  }

  /**
    Method to make authorization URL
    @method
    @param {String} [nonce] - A string used to prevent replay attacks. This value is returned in an ID token.
    @return {String}
    */
  make_auth_url(state, nonce) {
    const client_id = encodeURIComponent(this.channel_id)
    const redirect_uri = encodeURIComponent(this.callback_url)
    const scope = encodeURIComponent(this.scope)
    const prompt = encodeURIComponent(this.prompt)
    const bot_prompt = encodeURIComponent(this.bot_prompt)
    let url = `https://access.${this.endpoint}/oauth2/${api_version}/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&state=${state}&scope=${scope}&bot_prompt=${bot_prompt}`
    if (this.prompt) url += `&prompt=${encodeURIComponent(prompt)}`
    if (nonce) url += `&nonce=${encodeURIComponent(nonce)}`
    return url
  }

  /**
    Method to generate random string.
    @method
    @return {Number}
    */
  static _random() {
    return crypto.randomBytes(20).toString("hex")
  }
}

module.exports = LineLogin
