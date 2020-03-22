"use strict"

class displayService {
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

  async findAllDisplay() {
    const db_queue = this.db_queue
    try {
      const displays = await db_queue
        .select("*")
        .from("tbl_display")
        .where({ display_status: 1 })
      return Promise.resolve(displays)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelDisplay(displayId) {
    const db_queue = this.db_queue
    try {
      const display = await db_queue
        .select("*")
        .from("tbl_display")
        .where({ display_id: displayId })
        .first()
      return Promise.resolve(display)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findDisplayToday(params) {
    const db_queue = this.db_queue
    try {
      const data = await db_queue
        .select(
          "tbl_caller.*",
          "tbl_queue.queue_no",
          "tbl_counter_service.counter_service_name",
          "tbl_counter_service.counter_service_no"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_caller.queue_detail_id", "tbl_queue_detail.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue_detail.queue_id", "tbl_queue.queue_id")
        .innerJoin("tbl_counter_service", "tbl_caller.counter_service_id", "tbl_counter_service.counter_service_id")
        .where({
          "tbl_queue_detail.queue_status_id": params.queue_status_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereIn("tbl_caller.counter_service_id", params.counter_service_ids)
        .whereIn("tbl_queue_detail.service_type_id", params.service_type_id)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .orderBy("tbl_caller.call_time", "desc")
      return Promise.resolve(data)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findDisplayMedicine(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.*",
          "tbl_queue.queue_no",
          "tbl_counter_service.counter_service_name",
          "tbl_counter_service.counter_service_no"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_caller.queue_detail_id", "tbl_queue_detail.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue_detail.queue_id", "tbl_queue.queue_id")
        .innerJoin("tbl_counter_service", "tbl_caller.counter_service_id", "tbl_counter_service.counter_service_id")
        .where({
          "tbl_queue_detail.queue_status_id": params.queue_status_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereIn("tbl_caller.counter_service_id", params.counter_service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .orderBy("tbl_caller.call_time", "desc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = displayService
