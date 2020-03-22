"use strict"

const _ = require("lodash")
const bcrypt = require("bcrypt")

class authService {
  constructor(opts) {
    if (opts.mssql) {
      this.mssql = opts.mssql
    }
    if (opts.db) {
      this.db = opts.db
    }
    if (opts.db_queue) {
      this.db_queue = opts.db_queue
    }
  }

  async findByUsernameOrEmail(params) {
    try {
      const user = await this.db_queue
        .select("user.*", "profile.*")
        .from("user")
        .innerJoin("profile", "profile.user_id", "user.id")
        .where("user.username", params.username)
        .orWhere("user.email", params.username)
        .first()
      return Promise.resolve(user)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  comparePassword(password, hash) {
    return bcrypt.compareSync(password, hash)
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

  async updateLastLogin(userId, timestamp) {
    await this.db_queue("user")
      .where("id", userId)
      .update({ last_login_at: timestamp })
    return Promise.resolve("updated.")
  }
}

module.exports = authService
