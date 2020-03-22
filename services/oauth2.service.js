"use strict"

const _ = require("lodash")

class Oauth2Service {
  constructor(options) {
    this.db = options.db
  }

  async getClient(params) {
    const db = this.db
    try {
      const client = await db
        .select("*")
        .from("oauth_client")
        .where(params)
        .first()
      return Promise.resolve(client)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async updateClientUser(params) {
    const db = this.db
    try {
      const updated = await db("user")
        .where({
          id: params.userId
        })
        .update({
          clients: params.clients
        })
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async saveAuthorizationCode(attributes) {
    const db = this.db
    try {
      const inserted = await db("oauth_authorization").insert(attributes)
      return Promise.resolve(inserted[0])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getAuthorizationCode(condition) {
    const db = this.db
    try {
      const authorizationCode = await db
        .select("*")
        .from("oauth_authorization")
        .where(condition)
        .first()
      return Promise.resolve(authorizationCode)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async revokeAuthorizationCode(condition) {
    console.log("[revokeAuthorizationCode]", condition)
    const db = this.db
    try {
      const deleted = await db("oauth_authorization")
        .where(condition)
        .del()
      return Promise.resolve(deleted)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getUser(condition) {
    const db = this.db
    try {
      const user = await db
        .select("user.*", "profile.*")
        .from("user")
        .innerJoin("profile", "profile.user_id", "user.id")
        .where(condition)
        .first()
      return Promise.resolve(user)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async saveToken(attributes) {
    const db = this.db
    try {
      const inserted = await db("oauth_tokens").insert(attributes)
      return Promise.resolve(inserted[0])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async revokeToken(condition) {
    console.log("[revokeToken]", condition)
    const db = this.db
    try {
      const deleted = await db("oauth_tokens")
        .where(condition)
        .del()
      return Promise.resolve(deleted)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getToken(condition) {
    const db = this.db
    try {
      const token = await db
        .select("*")
        .from("oauth_tokens")
        .where(condition)
        .first()
      return Promise.resolve(token)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getRefreshToken(refreshToken) {
    const db = this.db
    try {
      const token = await db
        .select("*")
        .from("oauth_tokens")
        .where({ refresh_token: refreshToken })
        .first()
      return Promise.resolve(token)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getAccessToken(accessToken) {
    const db = this.db
    try {
      const token = await db
        .select("*")
        .from("oauth_tokens")
        .where({ access_token: accessToken })
        .first()
      return Promise.resolve(token)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  publicFields(user) {
    return _.pick(user, [
      "id",
      "username",
      "email",
      "registration_ip",
      "avatar",
      "role",
      "name",
      "public_email",
      "gravatar_email",
      "gravatar_id",
      "location",
      "website",
      "bio",
      "timezone"
    ])
  }
}

module.exports = Oauth2Service
