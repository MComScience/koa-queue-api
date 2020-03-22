"use strict"

class floorService {
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

  async findAll(isActive = true) {
    try {
      const db_queue = this.db_queue
      if (isActive) {
        const floors = await db_queue
          .select("*")
          .from("tbl_floor")
          .where({ floor_status: 1 })
        return Promise.resolve(floors)
      } else {
        const floors = await db_queue.select("*").from("tbl_floor")
        return Promise.resolve(floors)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findByIds(ids = []) {
    const db_queue = this.db_queue
    try {
      const floors = await db_queue
        .select("*")
        .from("tbl_floor")
        .where({ floor_status: 1 })
        .whereIn("floor_id", ids)
      return Promise.resolve(floors)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = floorService
