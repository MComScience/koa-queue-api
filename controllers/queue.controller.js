"use strict"

const QueueService = require("../services/queue.service")
const KioskService = require("../services/kiosk.service")
const utils = require("../utils")
const get = require("lodash/get")
const moment = require("moment")
const isEmpty = require("is-empty")
const unserialize = require("locutus/php/var/unserialize")
const array_count_values = require("locutus/php/array/array_count_values")
const fs = require("fs")
const path = require("path")
const mime = require("mime-types")

moment.locale("th")

/**
 * @method GET
 * @param {number} hn
 */
exports.getQueueToday = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.hn, 400, "invalid params.")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()
    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataQueueTodayByHn({ hn: ctx.query.hn, startDate: startDate, endDate: endDate })
    rows = rows.map(r => {
      return utils.updateObject(r, {
        user_picture: r.base_url ? `${r.base_url}${r.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(r.appoint_id)
      })
    })
    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {number} id
 */
exports.getQrcode = async (ctx, next) => {
  try {
    ctx.assert(ctx.params.id, 400, "invalid params.")
    const queueService = new QueueService({ db_queue: ctx.db_queue })
    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()
    let queue = await queueService.findDataQRCode({ id: ctx.params.id, startDate: startDate, endDate: endDate })
    if (queue) {
      queue = utils.updateObject(queue, {
        user_picture: queue.base_url ? `${queue.base_url}${queue.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(queue.appoint_id)
      })
    }

    ctx.body = queue
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {Array} service_ids
 * @param {string} service_type_id
 */
exports.getDataWaitHistory = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let rows = await queueService.getDataWait(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id),
        call_time: "",
        hold_time: "",
        counter_service_name: ""
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {string} service_type_id
 * @param {string} queue_detail_id
 */
exports.getDataWaitHistoryById = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.queue_detail_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let queue_detail_id = get(ctx.query, ["queue_detail_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      queue_detail_id: queue_detail_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let rows = await queueService.getDataWaitById(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id),
        call_time: "",
        hold_time: "",
        counter_service_name: ""
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {string} service_type_id
 * @param {string} counter_service_id
 */
exports.getDataCallHistory = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataCall(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {string} service_type_id
 * @param {string} counter_service_id
 * @param {string} caller_id
 */
exports.getDataCallHistoryById = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")
    ctx.assert(ctx.query.caller_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")
    let caller_id = get(ctx.query, ["caller_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id,
      caller_id: caller_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataCallHistoryById(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {string} service_type_id
 * @param {string} counter_service_id
 */
exports.getDataHoldHistory = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    // ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataHold(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {string} service_type_id
 * @param {string} counter_service_id
 * @param {string} caller_id
 */
exports.getDataHoldHistoryById = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    // ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")
    ctx.assert(ctx.query.caller_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")
    let caller_id = get(ctx.query, ["caller_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id,
      caller_id: caller_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataHoldById(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {string} service_type_id
 * @param {string} counter_service_id
 */
exports.getDataEndHistory = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataEndHistory(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {string} service_type_id
 * @param {string} counter_service_id
 */
exports.getDataWaitExamination = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataWaitExamination(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id),
        call_time: "",
        hold_time: ""
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {number} service_type_id
 * @param {number} counter_service_id
 * @param {number} queue_detail_id
 */
exports.getDataWaitExaminationById = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")
    ctx.assert(ctx.query.queue_detail_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")
    let queue_detail_id = get(ctx.query, ["queue_detail_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id,
      queue_detail_id: queue_detail_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataWaitExaminationById(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id),
        call_time: "",
        hold_time: ""
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {number} service_type_id
 * @param {number} counter_service_id
 */
exports.getDataCallExamination = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataCallExamination(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {number} service_type_id
 * @param {number} counter_service_id
 * @param {number} caller_id
 */
exports.getDataCallExaminationById = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")
    ctx.assert(ctx.query.caller_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")
    let caller_id = get(ctx.query, ["caller_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id,
      caller_id: caller_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataCallExaminationById(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {number} service_type_id
 * @param {number} counter_service_id
 */
exports.getDataHoldExamination = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataHoldExamination(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {number} service_type_id
 * @param {number} counter_service_id
 * @param {number} caller_id
 */
exports.getDataHoldExaminationById = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")
    ctx.assert(ctx.query.caller_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")
    let caller_id = get(ctx.query, ["caller_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id,
      caller_id: caller_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataHoldExaminationById(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {number} service_type_id
 */
exports.getDataWaitMedicine = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataWaitMedicine(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id),
        call_time: "",
        hold_time: "",
        counter_service_name: ""
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {number} service_type_id
 * @param {number} queue_detail_id
 */
exports.getDataWaitMedicineById = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.queue_detail_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let queue_detail_id = get(ctx.query, ["queue_detail_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      queue_detail_id: queue_detail_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataWaitMedicineById(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id),
        call_time: "",
        hold_time: "",
        counter_service_name: ""
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {number} service_type_id
 * @param {number} counter_service_id
 */
exports.getDataCallMedicine = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataCallMedicine(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {number} service_type_id
 * @param {number} counter_service_id
 * @param {number} caller_id
 */
exports.getDataCallMedicineById = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")
    ctx.assert(ctx.query.caller_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")
    let caller_id = get(ctx.query, ["caller_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id,
      caller_id: caller_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataCallMedicineById(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {number} service_type_id
 * @param {number} counter_service_id
 */
exports.getDataHoldMedicine = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataHoldMedicine(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 * @param {number} service_type_id
 * @param {number} counter_service_id
 * @param {number} caller_id
 */
exports.getDataHoldMedicineById = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.counter_service_id, 400, "invalid params.")
    ctx.assert(ctx.query.caller_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")
    let counter_service_id = get(ctx.query, ["counter_service_id"], "")
    let caller_id = get(ctx.query, ["caller_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const params = {
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id,
      counter_service_id: counter_service_id,
      caller_id: caller_id
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataHoldMedicineById(params)
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })

    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method DELETE
 * @param {number} id
 */
exports.deleteQueueHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.id, 400, "invalid params.")

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    const queue = await queueService.findModelQueueDetail({ queue_detail_id: ctx.query.id })

    ctx.assert(queue, 404, "ไม่พบข้อมูลคิว.")

    const current_date = moment(utils.getCurrentDate()).format("YYYY-MM-DD")
    const created_at = moment(queue.created_at).format("YYYY-MM-DD")

    if (current_date !== created_at) {
      ctx.throw(403, "รายการคิวนี้ไม่ใช่รายการคิวปัจจุบัน ไม่สามารถลบรายการได้!")
    }
    const params = {
      id: ctx.query.id,
      updated_at: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
      updated_by: ctx.session.user.id
    }
    const res = await queueService.deleteQueue(params)
    const response = await queueService.findModelQueueDetail({ queue_detail_id: ctx.query.id })

    ctx.body = {
      message: "ลบรายการสำเร็จ",
      queue_detail: response
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {object} patient
 */
exports.updatePatientHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.patient, 400, "invalid params.")
    const queue = get(ctx.request.body, ["queue"], "")

    ctx.assert(queue, 404, "Data not found.")
    const queueService = new QueueService({ db_queue: ctx.db_queue })
    const patient = await queueService.findModelPatientById(queue.patient_id)

    ctx.assert(patient, 404, "Data not found.")
    const current_date = moment(utils.getCurrentDate()).format("YYYY-MM-DD")
    const created_at = moment(patient.created_at).format("YYYY-MM-DD")

    if (current_date !== created_at) {
      ctx.body = {
        patient: patient
      }
    } else {
      const params = utils.updateObject(ctx.body.patient, {
        updated_at: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
        updated_by: ctx.session.user.id
      })
      const updated = await queueService.updatePatient(params)
      const patient = await queueService.findModelPatientById(updated[0])
      ctx.body = {
        patient: patient
      }
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method PUT
 * @param {object} body
 */
exports.updateRequestFailed = async (ctx, next) => {
  try {
    const data = get(ctx.request.body, ["data"], [])
    const message = get(ctx.request.body, ["message"], "")
    const hn = get(data, ["hn"], "")
    const cid = get(data, ["cid"], "")
    const fullname = get(data, ["fullname"], "")
    const params = {
      message: message,
      hn: hn,
      cid: cid,
      fullname: fullname,
      created_at: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
      created_by: ctx.session.user.id
    }
    const queueService = new QueueService({ db_queue: ctx.db_queue })
    const model = await queueService.insertQueueFailed(params)
    ctx.body = {
      failed: {
        failed_id: model[0],
        clientIP: ctx.request.ip
      }
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} startDate
 * @param {string} endDate
 */
exports.getDataQueueList = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.startDate, 400, "invalid params.")
    ctx.assert(ctx.query.endDate, 400, "invalid params.")
    const startDate = `${ctx.query.startDate} 00:00:00`
    const endDate = `${ctx.query.endDate} 23:59:59`
    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataQueueList({ startDate: startDate, endDate: endDate })
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })
    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} startDate
 * @param {string} endDate
 * @param {number} id
 */
exports.getDataQueueListById = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.id, 400, "invalid params.")
    ctx.assert(ctx.query.startDate, 400, "invalid params.")
    ctx.assert(ctx.query.endDate, 400, "invalid params.")
    const startDate = `${ctx.query.startDate} 00:00:00`
    const endDate = `${ctx.query.endDate} 23:59:59`
    const queueService = new QueueService({ db_queue: ctx.db_queue })
    let rows = await queueService.getDataQueueListById({
      startDate: startDate,
      endDate: endDate,
      queue_detail_id: ctx.query.id
    })
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })
    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 */
exports.getUpdateDataOption = async (ctx, next) => {
  try {
    const kioskService = new KioskService({ db_queue: ctx.db_queue })

    // update settings
    const groups = await kioskService.findServiceGroups()

    // แผนก
    const services = await kioskService.findServices()

    // ประเภทคิว
    const queue_types = await kioskService.findAllQueueTypes()

    // วิธีการมา
    const coming_types = await kioskService.findAllComingTypes()

    // สถานะคิว
    const queue_status = await kioskService.findAllQueueStatus()

    const options = {
      groups: groups,
      services: services,
      queue_types: queue_types,
      coming_types: coming_types,
      queue_status: queue_status,
      client_ip: ctx.request.ip
    }
    ctx.body = options
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} hn
 */
exports.getDataQueueExToday = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.hn, 400, "invalid params.")
    const queueService = new QueueService({ db_queue: ctx.db_queue })
    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()
    let rows = await queueService.getDataQueueExToday({ hn: ctx.query.hn, startDate: startDate, endDate: endDate })
    rows = rows.map(row => {
      return utils.updateObject(row, {
        user_picture: row.base_url ? `${row.base_url}${row.path.replace(/\\/g, "/")}` : "",
        appoint_status: utils.getAppointStatus(row.appoint_id)
      })
    })
    ctx.body = rows
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} q
 * @param {array} service_ids
 * @param {string} service_type_id
 */
exports.searchPatientHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.q, 400, "invalid params.")
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")
    let service_type_id = get(ctx.query, ["service_type_id"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    const row = await queueService.searchPatient({
      q: ctx.query.q,
      startDate: startDate,
      endDate: endDate,
      service_ids: service_ids,
      service_type_id: service_type_id
    })

    ctx.assert(row, 404, "ไม่พบข้อมูล.")
    ctx.body = row
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids
 */
exports.getMedSchedulesByService = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_ids, 400, "invalid params.")

    let service_ids = get(ctx.query, ["service_ids"], "")

    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const schedule_date = moment(utils.getCurrentDate()).format("YYYY-MM-DD")
    const queueService = new QueueService({ db_queue: ctx.db_queue })
    const params = {
      schedule_date: schedule_date,
      service_ids: service_ids
    }
    const rows = await queueService.getMedSchedulesByService(params)
    let schedules = []
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index]
      const schedule_times = await queueService.findAllMedScheduleTime({ med_schedule_id: row.med_schedule_id })
      const end_times = schedule_times.map(d => d.end_time)
      if (end_times.length) {
        const max_time = end_times.reduce(function(a, b) {
          return a <= b ? b : a
        })
        const current_time = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
        const last_time = moment(`${schedule_date} ${max_time}`).format("YYYY-MM-DD HH:mm:ss")
        const isOverTime =
          parseFloat(moment(utils.getCurrentDate()).format("X")) > parseFloat(moment(last_time).format("X"))
        let updated_schedule_times = []
        for (let i = 0; i < schedule_times.length; i++) {
          const r = schedule_times[i]
          const schedule_date = moment(row.schedule_date).format("YYYY-MM-DD")
          const range_time =
            moment(`${schedule_date} ${r.start_time}`).format("HH:mm") +
            "-" +
            moment(`${schedule_date} ${r.end_time}`).format("HH:mm") // 12:00-14:00
          const rows_wait = await queueService.getDataWaitExaminationOfDoctor({
            service_id: row.service_id,
            service_type_id: 2,
            counter_service_id: row.counter_service_id,
            doctor_id: row.doctor_id,
            duration_time: ["คิวเสริม", range_time],
            startDate: startDate,
            endDate: endDate
          })
          updated_schedule_times.push({
            med_schedule_time_id: r.med_schedule_time_id,
            med_schedule_id: r.med_schedule_id,
            start_time: r.start_time,
            end_time: r.end_time,
            med_schedule_time_qty: r.med_schedule_time_qty,
            waiting_qty: rows_wait.length
          })
        }
        const doctor = utils.updateObject(row, {
          max_time: max_time,
          current_time: current_time,
          last_time: last_time,
          end_times: end_times,
          schedule_times: updated_schedule_times,
          over_time: isOverTime
        })
        schedules.push(doctor)
      }
    }
    ctx.body = schedules
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 */
exports.getPlayerOptions = async (ctx, next) => {
  try {
    const queueService = new QueueService({ db_queue: ctx.db_queue })
    const kioskService = new KioskService({ db_queue: ctx.db_queue })
    const players = await queueService.findAudioPlayer()
    const options = []
    for (let index = 0; index < players.length; index++) {
      const player = players[index]
      const service_ids = isEmpty(player.service_ids) ? [] : unserialize(player.service_ids)
      const services = await kioskService.findServices(service_ids)
      options.push(
        utils.updateObject(player, {
          service_ids: service_ids,
          services: services
        })
      )
    }
    ctx.body = options
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} caller
 */
exports.updateStatusCall = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.caller, 400, "invalid params.")
    const queueService = new QueueService({ db_queue: ctx.db_queue })
    const updated = await queueService.UpdateStatusCall(
      utils.updateObject(ctx.request.body.caller, {
        updated_at: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
        updated_by: ctx.session.user.id
      })
    )
    const data = await queueService.findOneModelCaller(updated)
    ctx.body = {
      message: "บันทึกสถานะสำเร็จ",
      updated: updated,
      data: data
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {number} id
 */
exports.checkQueueExamination = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.id, 400, "invalid params.")
    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    const queue = await queueService.checkQueueExamination({ id: ctx.query.id, startDate: startDate, endDate: endDate })
    if (!isEmpty(queue)) {
      ctx.body = {
        queue_status: "ok"
      }
    } else {
      ctx.body = {
        queue_status: "no ok"
      }
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} service_id
 * @param {string} service_type_id
 * @param {string} queue_detail_id
 */
exports.countWaitingQrcode = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.service_id, 400, "invalid params.")
    ctx.assert(ctx.query.service_type_id, 400, "invalid params.")
    ctx.assert(ctx.query.queue_detail_id, 400, "invalid params.")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const queueService = new QueueService({ db_queue: ctx.db_queue })
    const params = {
      service_id: get(ctx.query, ["service_id"], ""),
      service_type_id: get(ctx.query, ["service_type_id"], ""),
      queue_detail_id: get(ctx.query, ["queue_detail_id"], ""),
      startDate: startDate,
      endDate: endDate
    }
    const rows = await queueService.countWaitingQrcode(params)
    ctx.body = {
      count: rows.length
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.callWaitHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")
    const queue = get(ctx.request.body, ["queue"], [])

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id }) // รายละเอียดคิว
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id) // ข้อมูลคิว
    const caller = await queueService.findModelCallerByQueueId(queueDetail.queue_detail_id)
    if (!isEmpty(caller)) {
      ctx.throw(400, "คิวนี้ถูกเรียกไปแล้ว.")
    }

    const profileService = await queueService.findModelProfileServiceById(ctx.request.body.profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(ctx.request.body.counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    const call_time = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
    const modelCall = {
      queue_detail_id: queueDetail.queue_detail_id,
      counter_service_id: ctx.request.body.counter_service_id,
      profile_service_id: ctx.request.body.profile_service_id,
      call_time: call_time,
      call_group_key: utils.randomString(),
      caller_status: 0,
      created_at: utils.createdAt(),
      updated_at: utils.updatedAt(),
      created_by: ctx.session.user.id,
      updated_by: ctx.session.user.id
    }
    const callerId = await queueService.insertCaller(modelCall)
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 2,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(callerId)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const sources = await this.getSourceAudioFiles(ctx, counterService, modelQueue)

    ctx.body = {
      sources: sources,
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {array} queues
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.callMultipleQueueHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queues, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queues = get(ctx.request.body, ["queues"], [])
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const call_group_key = utils.randomString()
    const led_display = []
    for (let i = 0; i < queues.length; i++) {
      const queue = queues[i]
      led_display.push(queue.queue_no)
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)

    const response = []

    for (let i = 0; i < queues.length; i++) {
      const queue = queues[i]
      let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
      const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
      const caller = await queueService.findModelCallerByQueueId(queueDetail.queue_detail_id)
      if (!isEmpty(caller)) {
        ctx.throw(400, `คิว ${modelQueue.queue_no} ถูกเรียกไปแล้ว.`)
      }
      const modelService = await queueService.findModelServiceById(queueDetail.service_id)
      const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
      const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

      const call_time = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")

      const modelCall = {
        queue_detail_id: queueDetail.queue_detail_id,
        counter_service_id: counter_service_id,
        profile_service_id: profile_service_id,
        call_time: call_time,
        call_group_key: call_group_key,
        caller_status: 0,
        created_at: utils.createdAt(),
        updated_at: utils.updatedAt(),
        created_by: ctx.session.user.id,
        updated_by: ctx.session.user.id
      }
      const callerId = await queueService.insertCaller(modelCall)
      await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
        queue_status_id: 2,
        updated_at: utils.updatedAt(),
        updated_by: ctx.session.user.id
      })

      const modelCaller = await queueService.findModelCallerById(callerId)
      queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })
      const sources = await this.getSourceAudioFiles(ctx, counterService, modelQueue)

      response.push({
        sources: sources,
        caller: modelCaller,
        queue: modelQueue,
        queue_detail: queueDetail,
        profile_service: utils.updateObject(profileService, {
          service_ids: unserialize(profileService.service_ids),
          service_examination_ids: unserialize(profileService.service_examination_ids)
        }),
        service: modelService,
        service_group: modelServiceGroup,
        counter: counterService,
        patient_info: patient_info,
        led_display: led_display.join(" ")
      })
    }
    ctx.body = response
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.endWaitHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const caller = await queueService.findModelCallerByQueueId(queueDetail.queue_detail_id)
    if (!isEmpty(caller)) {
      ctx.throw(400, "คิวนี้เสร็จสิ้นไปแล้ว.")
    }
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    const call_time = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
    const end_time = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
    const modelCall = {
      queue_detail_id: queueDetail.queue_detail_id,
      counter_service_id: counter_service_id,
      profile_service_id: profile_service_id,
      call_time: call_time,
      end_time: end_time,
      call_group_key: utils.randomString(),
      caller_status: 1,
      created_at: utils.createdAt(),
      updated_at: utils.updatedAt(),
      created_by: ctx.session.user.id,
      updated_by: ctx.session.user.id
    }
    const callerId = await queueService.insertCaller(modelCall)
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 4,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(callerId)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })
    const sources = await this.getSourceAudioFiles(ctx, counterService, modelQueue)

    ctx.body = {
      sources: sources,
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.recallHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    await queueService.updateCaller(queue.caller_id, {
      caller_status: 0,
      call_time: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
      counter_service_id: counter_service_id,
      profile_service_id: profile_service_id,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 2,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(queue.caller_id)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })
    const sources = await this.getSourceAudioFiles(ctx, counterService, modelQueue)

    ctx.body = {
      sources: sources,
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.holdHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    await queueService.updateCaller(queue.caller_id, {
      hold_time: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 3,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(queue.caller_id)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })

    ctx.body = {
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.endHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    await queueService.updateCaller(queue.caller_id, {
      end_time: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id,
      caller_status: 1
    })
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 4,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(queue.caller_id)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })

    ctx.body = {
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.callWaitExaminationHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const caller = await queueService.findModelCallerByQueueId(queueDetail.queue_detail_id)
    if (!isEmpty(caller)) {
      ctx.throw(400, "คิวนี้ถูกเรียกไปแล้ว.")
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    const call_time = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
    const modelCall = {
      queue_detail_id: queueDetail.queue_detail_id,
      counter_service_id: counter_service_id,
      profile_service_id: profile_service_id,
      call_time: call_time,
      call_group_key: utils.randomString(),
      caller_status: 0,
      created_at: utils.createdAt(),
      updated_at: utils.updatedAt(),
      created_by: ctx.session.user.id,
      updated_by: ctx.session.user.id
    }
    const callerId = await queueService.insertCaller(modelCall)
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 2,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(callerId)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const sources = await this.getSourceAudioFiles(ctx, counterService, modelQueue)

    ctx.body = {
      sources: sources,
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {array} queues
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.callMultipleQueueExamination = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queues, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queues = get(ctx.request.body, ["queues"], [])
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const call_group_key = utils.randomString()
    const led_display = []
    for (let i = 0; i < queues.length; i++) {
      const queue = queues[i]
      led_display.push(queue.queue_no)
    }

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)

    const response = []

    for (let i = 0; i < queues.length; i++) {
      const queue = queues[i]
      let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
      const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
      const caller = await queueService.findModelCallerByQueueId(queueDetail.queue_detail_id)
      if (!isEmpty(caller)) {
        ctx.throw(400, `คิว ${modelQueue.queue_no} ถูกเรียกไปแล้ว.`)
      }
      const modelService = await queueService.findModelServiceById(queueDetail.service_id)
      const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
      const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

      const call_time = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")

      const modelCall = {
        queue_detail_id: queueDetail.queue_detail_id,
        counter_service_id: counter_service_id,
        profile_service_id: profile_service_id,
        call_time: call_time,
        call_group_key: call_group_key,
        caller_status: 0,
        created_at: utils.createdAt(),
        updated_at: utils.updatedAt(),
        created_by: ctx.session.user.id,
        updated_by: ctx.session.user.id
      }
      const callerId = await queueService.insertCaller(modelCall)
      await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
        queue_status_id: 2,
        updated_at: utils.updatedAt(),
        updated_by: ctx.session.user.id
      })

      const modelCaller = await queueService.findModelCallerById(callerId)
      queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })
      const sources = await this.getSourceAudioFiles(ctx, counterService, modelQueue)

      response.push({
        sources: sources,
        caller: modelCaller,
        queue: modelQueue,
        queue_detail: queueDetail,
        profile_service: utils.updateObject(profileService, {
          service_ids: unserialize(profileService.service_ids),
          service_examination_ids: unserialize(profileService.service_examination_ids)
        }),
        service: modelService,
        service_group: modelServiceGroup,
        counter: counterService,
        patient_info: patient_info,
        led_display: led_display.join(" ")
      })
    }
    ctx.body = response
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.endWaitExaminationHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const caller = await queueService.findModelCallerByQueueId(queueDetail.queue_detail_id)
    if (!isEmpty(caller)) {
      ctx.throw(400, `คิว ${modelQueue.queue_no} ได้ทำรายการเสร็จสิ้นคิวไปแล้ว.`)
    }
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    const call_time = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
    const end_time = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
    const modelCall = {
      queue_detail_id: queueDetail.queue_detail_id,
      counter_service_id: counter_service_id,
      profile_service_id: profile_service_id,
      call_time: call_time,
      end_time: end_time,
      call_group_key: utils.randomString(),
      caller_status: 1,
      created_at: utils.createdAt(),
      updated_at: utils.updatedAt(),
      created_by: ctx.session.user.id,
      updated_by: ctx.session.user.id
    }
    const callerId = await queueService.insertCaller(modelCall)
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 2,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(callerId)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })

    ctx.body = {
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.recallExaminationHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    await queueService.updateCaller(queue.caller_id, {
      caller_status: 0,
      call_time: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
      counter_service_id: counter_service_id,
      profile_service_id: profile_service_id,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 2,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(queue.caller_id)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })
    const sources = await this.getSourceAudioFiles(ctx, counterService, modelQueue)

    ctx.body = {
      sources: sources,
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.holdExaminationHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    await queueService.updateCaller(queue.caller_id, {
      hold_time: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
      counter_service_id: counter_service_id,
      profile_service_id: profile_service_id,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 3,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(queue.caller_id)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })

    ctx.body = {
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.endExaminationHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    await queueService.updateCaller(queue.caller_id, {
      caller_status: 1,
      end_time: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
      counter_service_id: counter_service_id,
      profile_service_id: profile_service_id,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 4,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(queue.caller_id)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })

    ctx.body = {
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.callWaitMedicineHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const caller = await queueService.findModelCallerByQueueId(queueDetail.queue_detail_id)
    if (!isEmpty(caller)) {
      ctx.throw(400, `คิว ${modelQueue.queue_no} ถูกเรียกไปแล้ว.`)
    }
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    const call_time = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
    const modelCall = {
      queue_detail_id: queueDetail.queue_detail_id,
      counter_service_id: counter_service_id,
      profile_service_id: profile_service_id,
      call_time: call_time,
      call_group_key: utils.randomString(),
      caller_status: 0,
      created_at: utils.createdAt(),
      updated_at: utils.updatedAt(),
      created_by: ctx.session.user.id,
      updated_by: ctx.session.user.id
    }
    const callerId = await queueService.insertCaller(modelCall)
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 2,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(callerId)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const sources = await this.getSourceAudioFiles(ctx, counterService, modelQueue)

    ctx.body = {
      sources: sources,
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.endWaitMedicineHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const caller = await queueService.findModelCallerByQueueId(queueDetail.queue_detail_id)
    if (!isEmpty(caller)) {
      ctx.throw(400, `คิว ${modelQueue.queue_no} ได้ทำรายการเสร็จสิ้นคิวไปแล้ว.`)
    }
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    const call_time = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
    const end_time = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
    const modelCall = {
      queue_detail_id: queueDetail.queue_detail_id,
      counter_service_id: counter_service_id,
      profile_service_id: profile_service_id,
      call_time: call_time,
      end_time: end_time,
      call_group_key: utils.randomString(),
      caller_status: 1,
      created_at: utils.createdAt(),
      updated_at: utils.updatedAt(),
      created_by: ctx.session.user.id,
      updated_by: ctx.session.user.id
    }
    const callerId = await queueService.insertCaller(modelCall)
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 2,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(callerId)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })

    ctx.body = {
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 */
exports.problemPrescriptionMedicine = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    await queueService.updateQueueDetail(queue.queue_detail_id, {
      queue_status_id: 6,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })
    const queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    ctx.body = {
      queue_detail: queueDetail
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.recallMedicineHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    await queueService.updateCaller(queue.caller_id, {
      caller_status: 0,
      call_time: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
      counter_service_id: counter_service_id,
      profile_service_id: profile_service_id,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 2,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(queue.caller_id)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })
    const sources = await this.getSourceAudioFiles(ctx, counterService, modelQueue)

    ctx.body = {
      sources: sources,
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.holdMedicineHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    await queueService.updateCaller(queue.caller_id, {
      hold_time: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
      counter_service_id: counter_service_id,
      profile_service_id: profile_service_id,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 3,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(queue.caller_id)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })

    ctx.body = {
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} queue
 * @param {number} profile_service_id
 * @param {number} counter_service_id
 */
exports.endMedicineHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.request.body.queue, 400, "invalid params.")
    ctx.assert(ctx.request.body.profile_service_id, 400, "invalid params.")
    ctx.assert(ctx.request.body.counter_service_id, 400, "invalid params.")

    const queue = get(ctx.request.body, ["queue"], "")
    const profile_service_id = get(ctx.request.body, ["profile_service_id"], "")
    const counter_service_id = get(ctx.request.body, ["counter_service_id"], "")

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    let queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue.queue_detail_id })
    const modelQueue = await queueService.findModelQueueById(queueDetail.queue_id)
    const profileService = await queueService.findModelProfileServiceById(profile_service_id)
    const counterService = await queueService.findModelCounterServiceById(counter_service_id)
    const modelService = await queueService.findModelServiceById(queueDetail.service_id)
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id)
    const patient_info = await queueService.findModelPatientById(modelQueue.patient_id)

    await queueService.updateCaller(queue.caller_id, {
      caller_status: 1,
      end_time: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss"),
      counter_service_id: counter_service_id,
      profile_service_id: profile_service_id,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })
    await queueService.updateQueueDetail(queueDetail.queue_detail_id, {
      queue_status_id: 4,
      updated_at: utils.updatedAt(),
      updated_by: ctx.session.user.id
    })

    const modelCaller = await queueService.findModelCallerById(queue.caller_id)
    queueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queueDetail.queue_detail_id })

    ctx.body = {
      caller: modelCaller,
      queue: modelQueue,
      queue_detail: queueDetail,
      profile_service: utils.updateObject(profileService, {
        service_ids: unserialize(profileService.service_ids),
        service_examination_ids: unserialize(profileService.service_examination_ids)
      }),
      service: modelService,
      service_group: modelServiceGroup,
      counter: counterService,
      patient_info: patient_info,
      led_display: modelQueue.queue_no
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} patient_info
 * @param {array} appoints
 * @param {object} appoint_selected
 * @param {object} service
 * @param {number} queue_type_id
 * @param {number} coming_type_id
 * @param {object} patient_right
 * @param {string} message_right
 * @param {number} service_point_id
 * @param {number} service_type_id
 * @param {number} kiosk_id
 */
exports.registerHanlder = async (ctx, next) => {
  try {
    const bodyParams = ctx.request.body
    ctx.assert(bodyParams.patient_info, 400, "invalid params.")
    ctx.assert(bodyParams.service, 400, "invalid params.")
    ctx.assert(bodyParams.queue_type_id, 400, "invalid params.")
    ctx.assert(bodyParams.coming_type_id, 400, "invalid params.")
    ctx.assert(bodyParams.service_point_id, 400, "invalid params.")

    const patient_info = get(bodyParams, ["patient_info"]) // ข้อมูลผู้ป่วย
    const appoints = get(bodyParams, ["appoints"], []) // ข้อมูลนัดผู้ป่วย
    const appoint_selected = get(bodyParams, ["appoint_selected"], null) // แผนกนัดที่เลือก
    const service = get(bodyParams, ["service"], null) // ข้อมูลแผนก
    const queue_type_id = get(bodyParams, ["queue_type_id"], null) // ประเภทคิว
    const coming_type_id = get(bodyParams, ["coming_type_id"], null) // วิธีการมา
    const service_point_id = get(bodyParams, ["service_point_id"], null) // จุดออกบัตรคิว
    const service_type_id = get(bodyParams, ["service_type_id"], null) // ประเภทคิวบริการ
    const patient_right = get(bodyParams, ["patient_right"], []) // ข้อมูลสิทธิการรักษา
    const message_right = get(bodyParams, ["message_right"], "") // ชื่อสิทธิการรักษา

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    const modelService = await queueService.findModelServiceById(service.service_id) // แผนก
    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id) // กลุ่มแผนก
    const modelPrefix = await queueService.findModelPrefixById(modelService.prefix_id) // ตัวอักษรหน้าเลขคิว

    // วันปัจุบัน 1-7
    const schedule_day = moment(utils.getCurrentDate()).format("E")
    const schedule = await queueService.findOneScheduleSetting({
      service_id: modelService.service_id,
      schedule_day: schedule_day,
      schedule_active: 1
    })
    if (!isEmpty(schedule)) {
      const current_date = moment(utils.getCurrentDate()).format("YYYY-MM-DD") // วันที่ปัจจุบัน
      const current_datetime = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss") // วันที่และเวลาปัจจุบัน
      const current_time_unix = parseFloat(moment(utils.getCurrentDate()).format("X"))
      const service_start_time_unix = parseFloat(moment(`${current_date} ${schedule.start_time}`).format("X"))
      const service_end_time_unix = parseFloat(moment(`${current_date} ${schedule.end_time}`).format("X"))

      let service_online = false
      if (current_time_unix >= service_start_time_unix && current_time_unix <= service_end_time_unix) {
        service_online = true
      }
      if (!service_online) {
        ctx.throw(400, "ไม่สามารถทำรายการได้ เนื่องจากแผนกนี้ยังไม่ได้เปิดให้บริการในเวลานี้!")
      }
    }

    const isAppoint = appoints.length > 0 // เช็คว่ามีนัดหรือไม่
    let userId = ctx.session.user.id // ไอดีผู้บันทึก
    if (!isEmpty(bodyParams.kiosk_id)) {
      const modelKiosk = await queueService.findModelKioskById(bodyParams.kiosk_id)
      userId = modelKiosk.user_id
    }
    const is_prefix_succession = modelService.prefix_succession === 1 // ออกเลขคิวต่อเนื่อง

    let appoint_id = null // ไอดีแผนกนัด
    let user_picture = null // รูปภาพผู้ป่วย

    // ค้นหาข้อมูลผู้ป่วยที่ลงทะเบียนล่าสุด
    const oldPatient = await queueService.findOldPatient({
      hn: patient_info.hn,
      startDate: startDate,
      endDate: endDate
    })
    let patient = null
    // ถ้ายังไม่เคยลงทะเบียน
    if (isEmpty(oldPatient)) {
      const attributes = {
        hn: get(patient_info, ["hn"], ""),
        vn: get(patient_info, ["vn"], ""),
        cid: get(patient_info, ["cid"], ""),
        passid: get(patient_info, ["passid"], ""),
        title: get(patient_info, ["title"], ""),
        firstname: get(patient_info, ["firstname"], ""),
        lastname: get(patient_info, ["lastname"], ""),
        fullname: get(patient_info, ["fullname"], ""),
        birth_date: null,
        age: get(patient_info, ["age"], ""),
        blood_group: get(patient_info, ["blood_group"], ""),
        nation: get(patient_info, ["nation"], ""),
        fulladdress: "",
        occ: get(patient_info, ["occ"], ""),
        maininscl_name: message_right,
        subinscl_name: get(patient_right, ["subinscl_name"], ""),
        created_at: utils.createdAt(),
        updated_at: utils.updatedAt(),
        created_by: userId,
        updated_by: userId
      }
      const patientId = await queueService.insertPatient(attributes)
      patient = await queueService.findPatientById(patientId)
    } else {
      const attributes = {
        hn: get(patient_info, ["hn"], oldPatient.hn),
        vn: get(patient_info, ["vn"], oldPatient.vn),
        cid: get(patient_info, ["cid"], oldPatient.vn),
        passid: get(patient_info, ["passid"], oldPatient.passid),
        title: get(patient_info, ["title"], oldPatient.title),
        firstname: get(patient_info, ["firstname"], oldPatient.firstname),
        lastname: get(patient_info, ["lastname"], oldPatient.lastname),
        fullname: get(patient_info, ["fullname"], oldPatient.fullname),
        birth_date: null,
        age: get(patient_info, ["age"], oldPatient.age),
        blood_group: get(patient_info, ["blood_group"], oldPatient.blood_group),
        nation: get(patient_info, ["nation"], oldPatient.nation),
        fulladdress: "",
        occ: get(patient_info, ["occ"], oldPatient.occ),
        maininscl_name: message_right || oldPatient.maininscl_name,
        subinscl_name: get(patient_right, ["subinscl_name"], oldPatient.subinscl_name),
        updated_at: utils.updatedAt(),
        updated_by: userId
      }
      await queueService.updatePatient(oldPatient.patient_id, attributes)
      patient = await queueService.findPatientById(oldPatient.patient_id)
    }
    const isAppointSplit = modelService.appoint_split === 1 // แยกคิวนัด true
    let prefix_code = modelPrefix.prefix_code
    // ถ้าแยกคิวนัด
    if (isAppointSplit) {
      // ถ้าเลือกแผนกนัด
      if (appoint_selected) {
        const AppointPrefixCode = await queueService.findModelPrefixById(modelService.appoint_prefix_id)
        prefix_code = modelPrefix.prefix_code + get(AppointPrefixCode, ["prefix_code"], "A")
      } else {
        const NoAppointPrefixCode = await queueService.findModelPrefixById(modelService.no_appoint_prefix_id)
        prefix_code = modelPrefix.prefix_code + get(NoAppointPrefixCode, ["prefix_code"], "B")
      }
    }
    // บันทึกรูปภาพ
    const photo = get(patient_info, ["photo"], null)
    if (!isEmpty(photo)) {
      const modelStorage = await this.saveImagePatient(ctx, patient_info, patient.patient_id)
      if (modelStorage) {
        user_picture = `${modelStorage.base_url}/public${modelStorage.path}`
      }
    }

    // ค้นหาข้อมูลนัด
    const modelAppoint = await queueService.findOneAppoint({
      patient_id: patient.patient_id
      // appoint_date: moment(utils.getCurrentDate()).format("YYYY-MM-DD")
    })
    // ถ้ามีข้อมูลนัดและยังไม่มีข้อมูลผู้ป่วย
    if (isAppoint && isEmpty(modelAppoint)) {
      for (let i = 0; i < appoints.length; i++) {
        const appoint = appoints[i]
        const appoint_date = moment(utils.getCurrentDate()).format("YYYY-MM-DD")
        const app_time_from = get(appoint, ["app_time_from"], "")
        const app_time_to = get(appoint, ["app_time_to"], "")
        const appoint_attr = {
          patient_id: patient.patient_id,
          appoint_date: isEmpty(appoint.appoint_date) ? appoint_date : appoint.appoint_date,
          app_time_from: app_time_from,
          app_time_to: app_time_to,
          app_note: get(appoint, ["app_note"], ""),
          dept_code: get(appoint, ["dept_code"], ""),
          dept_desc: get(appoint, ["dept_desc"], ""),
          doc_code: get(appoint, ["doc_code"], ""),
          doc_name: get(appoint, ["doc_name"], "")
        }
        appoint_id = await queueService.insertAppoint(appoint_attr)
      }
    } else if (!isEmpty(appoint_selected)) {
      // ถ้าเลือกแผนกนัด
      const modelAppoint = await queueService.findOneAppoint({
        patient_id: patient.patient_id,
        dept_code: appoint_selected.dept_code
      })
      if (!isEmpty(modelAppoint)) {
        appoint_id = modelAppoint.appoint_id
      }
    }

    // คิวที่ลงทะเบียนวันนี้
    const queueToday = await queueService.getQueueToday({
      startDate: startDate,
      endDate: endDate,
      service_group_id: modelServiceGroup.service_group_id,
      service_id: modelService.service_id,
      hn: patient.hn,
      service_type_id: service_type_id
    })

    let modelQueue = null

    // ถ้ายังไม่เคยลงทะเบียน
    if (isEmpty(queueToday)) {
      // หาเลขคิวล่าสุด
      const lastQueue = await queueService.findLastQueue({
        service_group_id: modelServiceGroup.service_group_id,
        service_id: modelService.service_id,
        prefix_id: modelService.prefix_id,
        appoint_split: modelService.appoint_split,
        prefix_succession: modelService.prefix_succession,
        updated_at: moment(utils.getCurrentDate()).format("YYYY-MM-DD")
      })
      let last_number = "" // เลขคิวล่าสุด

      // ถ้ามีเลขคิวล่าสุด
      if (!isEmpty(lastQueue)) {
        last_number = lastQueue.number
      }
      // เลขคิวถัดไป
      const nextQueue = utils.runningQueueNumber({
        digit: modelService.service_num_digit,
        last_number: last_number,
        prefix: prefix_code
      })

      const queueAttributes = {
        queue_no: nextQueue,
        patient_id: patient.patient_id, // ไอดีผู้ป่วย
        queue_type_id: 1, // ประเภทคิว default คิวทั่วไป
        coming_type_id: coming_type_id, // วิธีการมา
        appoint_id: appoint_id, // ไอดีนัด
        service_point_id: service_point_id, // จุดออกบัตรคิว
        created_at: utils.createdAt(),
        updated_at: utils.updatedAt(),
        created_by: userId,
        updated_by: userId
      }
      const queueId = await queueService.insertQueue(queueAttributes)
      modelQueue = await queueService.findModelQueue({ queue_id: queueId })
      // ถ้ายังไม่มีเลขคิวล่าสุด ให้บันทึกรายการใหม่
      if (isEmpty(lastQueue)) {
        let autonumberAttributes = {
          prefix_id: modelPrefix.prefix_id,
          service_group_id: modelServiceGroup.service_group_id,
          appoint_split: modelService.appoint_split,
          prefix_succession: modelService.prefix_succession,
          number: nextQueue,
          updated_at: moment(utils.getCurrentDate()).format("YYYY-MM-DD")
        }
        // ถ้าไม่ออกเลขคิวต่อเนื่องแผนกอื่น
        if (!is_prefix_succession) {
          autonumberAttributes = utils.updateObject(autonumberAttributes, {
            service_id: modelService.service_id
          })
        }
        const autoNumberId = await queueService.insertAutoNumber(autonumberAttributes)
      } else {
        // อัพเดทเลขคิวล่าสุด
        await queueService.updateAutoNumber({ auto_number_id: lastQueue.auto_number_id }, { number: nextQueue })
      }
    } else {
      // อัพเดทข้อมูลคิว
      const attributes = {
        queue_type_id: queue_type_id, // ประเภทคิว
        coming_type_id: coming_type_id, // วิธีการมา
        service_point_id: service_point_id, // จุดออกบัตรคิว
        updated_at: utils.updatedAt(),
        updated_by: userId
      }
      await queueService.updateQueue({ queue_id: queueToday.queue_id }, attributes)
      modelQueue = await queueService.findModelQueue({ queue_id: queueToday.queue_id })
    }

    ctx.assert(modelQueue, 400, "เกิดข้อผิดพลาดในการลงทะเบียนคิว.")

    // ค้นหาข้อมูลคิว
    let modelQueueDetail = await queueService.findModelQueueDetail({
      queue_id: modelQueue.queue_id,
      service_group_id: modelServiceGroup.service_group_id,
      service_id: modelService.service_id
    })

    // ถ้ายังไม่เคยลงทะเบียน
    if (isEmpty(modelQueueDetail)) {
      const attributes = {
        queue_id: modelQueue.queue_id,
        service_group_id: modelServiceGroup.service_group_id,
        service_id: modelService.service_id,
        queue_status_id: 1,
        service_type_id: service_type_id,
        created_by: userId,
        updated_by: userId,
        created_at: utils.createdAt(),
        updated_at: utils.updatedAt()
      }
      const queue_detail_id = await queueService.insertQueueDetail(attributes)
      modelQueueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue_detail_id })
    } else {
      // อัพเดทข้อมูลคิว
      await queueService.updateQueueDetail(
        { queue_detail_id: modelQueueDetail.queue_detail_id },
        { updated_at: utils.updatedAt(), updated_by: userId }
      )
    }
    // คำนวณระยะเวลารอคอย
    if (isEmpty(modelQueueDetail.duration_time)) {
      const calculate = await this.calculateHistory(ctx, {
        service: modelService,
        queue_detail_id: modelQueueDetail.queue_detail_id,
        service_type_id: service_type_id
      })
      // อัพเดทข้อมูลคิว
      await queueService.updateQueueDetail(
        { queue_detail_id: modelQueueDetail.queue_detail_id },
        {
          updated_at: utils.updatedAt(),
          updated_by: userId,
          waiting_qty: calculate.waiting_qty,
          std_time: calculate.std_time,
          duration_time: calculate.duration_time
        }
      )
      modelQueueDetail = await queueService.findModelQueueDetail({ queue_detail_id: modelQueueDetail.queue_detail_id })
    }
    ctx.body = {
      service: modelService,
      service_group: modelServiceGroup,
      queue: modelQueue,
      patient_info: patient,
      queue_detail: modelQueueDetail,
      user_picture: user_picture,
      client_ip: ctx.request.ip
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} patient_info
 * @param {number} service_point_id
 * @param {number} service_type_id
 * @param {number} counter_service_id
 * @param {number} service_id
 * @param {number} doctor_id
 */
exports.registerExaminationHandler = async (ctx, next) => {
  try {
    const bodyParams = ctx.request.body
    ctx.assert(bodyParams.patient_info, 400, "invalid params.")
    ctx.assert(bodyParams.counter_service_id, 400, "invalid params.")
    ctx.assert(bodyParams.doctor_id, 400, "invalid params.")
    ctx.assert(bodyParams.service_id, 400, "invalid params.")
    ctx.assert(bodyParams.service_point_id, 400, "invalid params.")
    ctx.assert(bodyParams.service_type_id, 400, "invalid params.")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const patient_info = get(bodyParams, ["patient_info"]) // ข้อมูลผู้ป่วย
    const counter_service_id = get(bodyParams, ["counter_service_id"], null) // ไอดีช่องบริการที่เลือก
    const service_id = get(bodyParams, ["service_id"], null) // ไอดีแผนก
    const doctor_id = get(bodyParams, ["doctor_id"], null) // ไอดีแพทย์ที่เลือก
    const service_point_id = get(bodyParams, ["service_point_id"], null) // จุดออกบัตรคิว
    const service_type_id = get(bodyParams, ["service_type_id"], null) // ประเภทคิวบริการ

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    const modelService = await queueService.findModelServiceById(service_id) // แผนก
    ctx.assert(modelService, 404, "ไม่พบข้อมูลแผนก.")

    const current_date = moment(utils.getCurrentDate()).format("YYYY-MM-DD")
    const current_datetime = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
    const current_time_unix = parseFloat(moment(utils.getCurrentDate()).format("X"))
    const service_start_time_unix = parseFloat(moment(`${current_date} ${modelService.service_start_time}`).format("X"))
    const service_end_time_unix = parseFloat(moment(`${current_date} ${modelService.service_end_time}`).format("X"))

    // ตรวจสอบเวลาให้บริการ
    let service_online = false
    if (current_time_unix >= service_start_time_unix && current_time_unix <= service_end_time_unix) {
      service_online = true
    }
    if (!service_online) {
      ctx.throw(400, "ไม่สามารถทำรายการได้ เนื่องจากแผนกนี้ยังไม่ได้เปิดให้บริการในเวลานี้!")
    }

    const patient = await queueService.findPatientById(patient_info.patient_id)
    ctx.assert(patient, 404, "ไม่พบข้อมูลผู้ป่วย.")

    const modelQueue = await queueService.findModelQueue({ queue_id: patient_info.queue_id })
    ctx.assert(modelQueue, 404, "ไม่พบข้อมูลคิว.")

    let oldModelQueueDetail = await queueService.findModelQueueDetail({ queue_detail_id: patient_info.queue_detail_id })
    ctx.assert(oldModelQueueDetail, 404, "ไม่พบข้อมูลคิว.")

    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id) // กลุ่มแผนก
    ctx.assert(modelServiceGroup, 404, "ไม่พบข้อมูลกลุ่มแผนก.")

    const modelPrefix = await queueService.findModelPrefixById(modelService.prefix_id) // ตัวอักษรหน้าเลขคิว
    ctx.assert(modelPrefix, 404, "ไม่พบข้อมูลตัวอักษรหน้าเลขคิว.")

    const modelCounterService = await queueService.findModelCounterService({ counter_service_id: counter_service_id })
    ctx.assert(modelCounterService, 404, "ไม่พบข้อมูลช่องบริการ.")

    const modelDoctor = await queueService.findModelDoctor({ doctor_id: doctor_id })
    ctx.assert(modelDoctor, 404, "ไม่พบข้อมูลแพทย์.")

    const isAppointSplit = modelService.appoint_split === 1 // แยกคิวนัด true
    let prefix_code = modelPrefix.prefix_code // ตัวอักษรนำหน้าเลขคิว
    // ถ้าแยกคิวนัด
    if (isAppointSplit) {
      // ถ้าเลือกแผนกนัด
      if (!isEmpty(modelQueue.appoint_id)) {
        const AppointPrefixCode = await queueService.findModelPrefixById(modelService.appoint_prefix_id)
        prefix_code = modelPrefix.prefix_code + get(AppointPrefixCode, ["prefix_code"], "A")
      } else {
        const NoAppointPrefixCode = await queueService.findModelPrefixById(modelService.no_appoint_prefix_id)
        prefix_code = modelPrefix.prefix_code + get(NoAppointPrefixCode, ["prefix_code"], "B")
      }
    }

    const userId = ctx.session.user.id
    // ออกเลขคิวต่อเนื่อง
    const is_prefix_succession = modelService.prefix_succession === 1

    // คิวที่ลงทะเบียนวันนี้
    const queueToday = await queueService.getQueueToday({
      startDate: startDate,
      endDate: endDate,
      service_group_id: modelServiceGroup.service_group_id,
      service_id: modelService.service_id,
      hn: patient.hn,
      service_type_id: service_type_id
    })
    if (!isEmpty(queueToday)) {
      ctx.throw(400, "ไม่สามารถออกคิวซ้ำได้ เนื่องจากได้ออกคิวห้องตรวจแล้ว!")
    }
    // หาเลขคิวล่าสุด
    const lastQueue = await queueService.findLastQueue({
      service_group_id: modelServiceGroup.service_group_id,
      service_id: modelService.service_id,
      prefix_id: modelService.prefix_id,
      appoint_split: modelService.appoint_split,
      prefix_succession: modelService.prefix_succession,
      updated_at: moment(utils.getCurrentDate()).format("YYYY-MM-DD")
    })
    let last_number = "" // เลขคิวล่าสุด

    // ถ้ามีเลขคิวล่าสุด
    if (!isEmpty(lastQueue)) {
      last_number = lastQueue.number
    }
    // เลขคิวถัดไป
    const nextQueue = utils.runningQueueNumber({
      digit: modelService.service_num_digit,
      last_number: last_number,
      prefix: prefix_code
    })

    const queueAttributes = {
      queue_no: nextQueue,
      patient_id: patient.patient_id, // ไอดีผู้ป่วย
      queue_type_id: 1, // ประเภทคิว default คิวทั่วไป
      coming_type_id: modelQueue.coming_type_id, // วิธีการมา
      appoint_id: modelQueue.appoint_id, // ไอดีนัด
      service_point_id: service_point_id, // จุดออกบัตรคิว
      created_at: utils.createdAt(),
      updated_at: utils.updatedAt(),
      created_by: userId,
      updated_by: userId
    }
    const queueId = await queueService.insertQueue(queueAttributes)
    const modelQueueEx = await queueService.findModelQueue({ queue_id: queueId })

    // ถ้ายังไม่มีเลขคิวล่าสุด ให้บันทึกรายการใหม่
    if (isEmpty(lastQueue)) {
      let autonumberAttributes = {
        prefix_id: modelPrefix.prefix_id,
        service_group_id: modelServiceGroup.service_group_id,
        appoint_split: modelService.appoint_split,
        prefix_succession: modelService.prefix_succession,
        number: nextQueue,
        updated_at: moment(utils.getCurrentDate()).format("YYYY-MM-DD")
      }
      // ถ้าไม่ออกเลขคิวต่อเนื่องแผนกอื่น
      if (!is_prefix_succession) {
        autonumberAttributes = utils.updateObject(autonumberAttributes, {
          service_id: modelService.service_id
        })
      }
      await queueService.insertAutoNumber(autonumberAttributes)
    } else {
      // อัพเดทเลขคิวล่าสุด
      await queueService.updateAutoNumber({ auto_number_id: lastQueue.auto_number_id }, { number: nextQueue })
    }

    // ค้นหาข้อมูลคิว
    let modelQueueDetailEx = await queueService.findModelQueueDetail({
      queue_id: modelQueueEx.queue_id,
      service_group_id: modelServiceGroup.service_group_id,
      service_id: modelService.service_id
    })

    // อัพเดทข้อมูลคิว
    await queueService.updateQueueDetail(
      { queue_detail_id: oldModelQueueDetail.queue_detail_id },
      { updated_at: utils.updatedAt(), updated_by: userId, examination_status: "Yes" }
    )
    oldModelQueueDetail = await queueService.findModelQueueDetail({
      queue_detail_id: oldModelQueueDetail.queue_detail_id
    })

    // ถ้ายังไม่เคยลงทะเบียน
    if (isEmpty(modelQueueDetailEx)) {
      const attributes = {
        queue_id: modelQueueEx.queue_id,
        service_group_id: modelServiceGroup.service_group_id,
        service_id: modelService.service_id,
        queue_status_id: 1,
        service_type_id: service_type_id,
        counter_service_id: modelCounterService.counter_service_id,
        doctor_id: doctor_id,
        parent_id: oldModelQueueDetail.queue_detail_id,
        created_by: userId,
        updated_by: userId,
        created_at: utils.createdAt(),
        updated_at: utils.updatedAt()
      }
      const queue_detail_id = await queueService.insertQueueDetail(attributes)
      modelQueueDetailEx = await queueService.findModelQueueDetail({ queue_detail_id: queue_detail_id })
    }
    // คำนวณคิวรอและระยะเวลารอคอย
    const calculate = await this.calculateExamination(ctx, {
      service: modelService,
      queue_detail_id: modelQueueDetailEx.queue_detail_id,
      service_type_id: service_type_id,
      doctor_id: doctor_id,
      counter_service_id: counter_service_id
    })
    // อัพเดทข้อมูลคิว
    await queueService.updateQueueDetail(
      { queue_detail_id: modelQueueDetailEx.queue_detail_id },
      {
        updated_at: utils.updatedAt(),
        updated_by: userId,
        waiting_qty: calculate.waiting_qty,
        duration_time: calculate.duration_time
      }
    )
    modelQueueDetailEx = await queueService.findModelQueueDetail({
      queue_detail_id: modelQueueDetailEx.queue_detail_id
    })

    const storage = await queueService.findOneModelStorage({ ref_id: patient.patient_id, ref_table: "tbl_patient" })

    ctx.body = {
      service: modelService,
      service_group: modelServiceGroup,
      queue: modelQueueEx,
      queue_detail: modelQueueDetailEx,
      old_queue_detail: oldModelQueueDetail,
      user_picture: isEmpty(storage) ? "" : `${storage.base_url}/public${storage.path}`,
      client_ip: ctx.request.ip
    }
  } catch (error) {
    ctx.throw(error)
  }
}

exports.getSourceAudioFiles = async (ctx, counter, queue) => {
  try {
    const queueService = new QueueService({ db_queue: ctx.db_queue })
    const SoundService = await queueService.findModelAudioFileById(counter.counter_service_sound)
    const SoundServiceNo = await queueService.findModelAudioFileById(counter.counter_service_no_sound)

    const basePath = `/media/${SoundServiceNo.audio_file_path_name}`
    const queueNumber = String(queue.queue_no).split("")
    const sounds = queueNumber.map(number => {
      return `${basePath}/${SoundService.audio_file_path_name}_${number}.wav`
    })
    const begin = [`${basePath}/please.wav`]
    const end = [
      `/media/${SoundService.audio_file_path_name}/${SoundService.audio_file_name}`,
      `${basePath}/${SoundServiceNo.audio_file_name}`,
      `${basePath}/${SoundServiceNo.audio_file_path_name}_Sir.wav`
    ]

    let source = begin.concat(sounds)
    source = source.concat(end)
    return source
  } catch (error) {
    ctx.throw(error)
  }
}

exports.saveImagePatient = async (ctx, patient_info, patient_id) => {
  try {
    let modelStorage = null
    let base64str = patient_info.photo.replace("data:image/png;base64,", "").replace("data:image/jpeg;base64,", "")
    const buf = Buffer.from(base64str, "base64")

    const hn = patient_info.hn.replace(/\s/g, "")
    const filename = hn + ".jpg"
    const fullHN = utils.sprintf("%'.07d", hn)

    let rootDir = fullHN.substring(0, 3)
    const rootDirectory = path.join(__dirname, "..", "public", "images", "opd", rootDir)

    let subDir1 = fullHN.substring(3, 6)
    const subDirectory1 = path.join(__dirname, "..", "public", "images", "opd", rootDir, subDir1)

    const subDir2 = fullHN.substring(6)
    const subDirectory2 = path.join(__dirname, "..", "public", "images", "opd", rootDir, subDir1, subDir2)

    const isRootDir = fs.existsSync(rootDirectory)
    if (!isRootDir) {
      fs.mkdirSync(rootDirectory)
    }
    const isSubDirectory1 = fs.existsSync(subDirectory1)
    if (!isSubDirectory1) {
      fs.mkdirSync(subDirectory1)
    }
    const isSubDirectory2 = fs.existsSync(subDirectory2)
    if (!isSubDirectory2) {
      fs.mkdirSync(subDirectory2)
    }
    if (fs.existsSync(subDirectory2)) {
      const uploadDirectory = path.join(__dirname, "..", "public", "images", "opd", rootDir, subDir1, subDir2, filename)
      fs.writeFileSync(uploadDirectory, buf)
      await new Promise((resolve, reject) => {
        setTimeout(function() {
          resolve()
        }, 300)
      })
      if (fs.existsSync(uploadDirectory)) {
        const queueService = new QueueService({ db_queue: ctx.db_queue })
        await queueService.deleteFileStorageItem({ ref_id: patient_id, ref_table: "tbl_patient" })
        const stats = fs.statSync(uploadDirectory)
        const storage = {
          base_url: ctx.origin,
          path: `/images/opd/${rootDir}/${subDir1}/${subDir2}/${filename}`,
          type: mime.lookup(uploadDirectory),
          size: stats.size,
          name: hn,
          ref_id: patient_id,
          ref_table: "tbl_patient",
          component: "fileStorage",
          created_at: moment(utils.getCurrentDate()).format("X"),
          upload_ip: ctx.request.ip
        }
        const id = await queueService.insertFileStorageItem(storage)
        modelStorage = await queueService.findFileStorageItemById(id)
      }
    }
    return modelStorage
  } catch (error) {
    ctx.throw(error)
  }
}

exports.calculateHistory = async (ctx, params) => {
  try {
    const service = get(params, ["service"], null)
    const queue_detail_id = get(params, ["queue_detail_id"], null)
    const service_type_id = get(params, ["service_type_id"], null)

    const current_date = moment(utils.getCurrentDate()).format("YYYY-MM-DD") // วันที่ปัจจุบัน
    const service_day = moment(utils.getCurrentDate()).format("E")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    const setting = await queueService.findOneServiceSchedule({
      service_day: service_day,
      service_id: service.service_id
    })
    if (!isEmpty(setting)) {
      const average_time = get(setting, ["average_time"], 5) // เวลาเฉลี่ยในการซักประวัติ(นาที)
      const time_range = utils.unserialize(setting.time_range) || []
      const counters = await queueService.getCounters({ service_schedule_id: setting.service_schedule_id })

      const count_array = []
      const count_counter = []
      const default_duration_time = time_range[0] ? `${time_range[0].start_time}-${time_range[0].end_time}` : ""

      for (let i = 0; i < counters.length; i++) {
        const counter = counters[i]
        const coming_type_ids = utils.unserialize(counter.coming_type_ids) || []
        const appointment_ids = utils.unserialize(counter.appointment_ids) || []
        const queue_type_ids = utils.unserialize(counter.queue_type_ids) || []
        const appointment = utils.getAppointment(appointment_ids)
        // จำนวนคิวรอ
        const rows_wait = await queueService.getDataWaitCalculateHistory({
          service_id: service.service_id,
          service_type_id: service_type_id,
          coming_type_ids: coming_type_ids,
          queue_type_ids: queue_type_ids,
          appointment: appointment,
          queue_detail_id: queue_detail_id,
          startDate: startDate,
          endDate: endDate
        })
        count_counter.push({
          counter: counter.counter_service_name,
          count: rows_wait.length
        })
        if (rows_wait.length > 0) {
          count_array.push(rows_wait.length)
        }
      }

      // หาจำนวนคิวรอที่น้อยที่สุด
      let min_count = 0 // จำนวนคิวรอ
      let counter_qty = 0 // จำนวนโต๊ะที่มีจำนวนคิวรอเท่ากัน
      let duration_time = "" // ชวงเวลา
      let std_time = 0 // เวลารอคอยที่คำนวณได้

      if (!isEmpty(count_array)) {
        min_count = Math.min(count_array) // หาคิวรอที่น้อยที่สุด
        const count_values = array_count_values(count_array) // นับจำนวนคิว
        counter_qty = count_values[min_count] ? count_values[min_count] : 1 // จำนวนเคาท์เตอร์ที่มีจำนวนคิวรอเท่ากับจำนวนคิวที่น้อยที่สุด
        const waiting_qty = min_count // จำนวนคิวรอ

        std_time = (waiting_qty * average_time) / counter_qty + 5 // (จำนวนคิวรอที่น้อยที่สุด * เวลาเฉลี่ยในการซักประวัติ) / จำนวนเคาท์เตอร์ที่มีคิวรอเท่ากัน + เผื่อเวลา 5 นาที
        std_time = parseInt(std_time)

        const current_datetime = moment(utils.getCurrentDate()).add(std_time, "minutes") // เวลาปัจจุบัน + นาทีที่หาได้
        const calculate_time_unix = parseFloat(moment(current_datetime).format("X")) // วันที่ปัจจุบัน + เวลารอ

        // หาช่วงเวลา
        for (let i = 0; i < time_range.length; i++) {
          const time = time_range[i]
          const start_time_unix = parseFloat(moment(`${current_date} ${time.start_time}`).format("X"))
          const end_time_unix = parseFloat(moment(`${current_date} ${time.end_time}`).format("X"))
          if (calculate_time_unix >= start_time_unix && calculate_time_unix <= end_time_unix) {
            duration_time = `${time.start_time}-${time.end_time}`
            break
          }
        }

        if (isEmpty(duration_time)) {
          duration_time = default_duration_time
        }

        return {
          waiting_qty: waiting_qty,
          duration_time: duration_time,
          std_time: std_time
        }
      } else {
        return {
          waiting_qty: 0,
          duration_time: "",
          std_time: ""
        }
      }
    } else {
      return {
        waiting_qty: 0,
        duration_time: "",
        std_time: ""
      }
    }
  } catch (error) {
    ctx.throw(error)
  }
}

exports.calculateExamination = async (ctx, params) => {
  try {
    const service = get(params, ["service"], null) // ข้อมูลแผนก
    const doctor_id = get(params, ["doctor_id"], null) // ไอดีแพทย์ที่เลือก
    const counter_service_id = get(params, ["counter_service_id"], null) // ไอดีช่องบริการที่เลือก
    const service_type_id = get(params, ["service_type_id"], null) //
    const queue_detail_id = get(params, ["queue_detail_id"], null) //
    const current_date = moment(utils.getCurrentDate()).format("YYYY-MM-DD") // วันที่ปัจจุบัน

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    const schedule = await queueService.findOneMedSchedule({
      doctor_id: doctor_id,
      service_id: service.service_id,
      counter_service_id: counter_service_id,
      schedule_date: current_date,
      med_schedule_status: 1
    })

    let waiting_qty = 0
    let duration_time = ""

    if (!isEmpty(schedule)) {
      const schedule_times = await queueService.findAllMedScheduleTime({
        med_schedule_id: schedule.med_schedule_id
      })
      const current_time_unix = parseFloat(moment(utils.getCurrentDate()).format("X"))
      for (let i = 0; i < schedule_times.length; i++) {
        const schedule_time = schedule_times[i]
        const start_time_unix = parseFloat(moment(`${current_date} ${schedule_time.start_time}`).format("X"))
        const end_time_unix = parseFloat(moment(`${current_date} ${schedule_time.end_time}`).format("X"))

        const schedule_duration_time =
          moment(`${current_date} ${schedule_time.start_time}`).format("HH:mm") +
          "-" +
          moment(`${current_date} ${schedule_time.end_time}`).format("HH:mm")

        const rows_wait = await queueService.getDataWaitCalculateExamination({
          service_id: service.service_id,
          service_type_id: service_type_id,
          counter_service_id: counter_service_id,
          doctor_id: doctor_id,
          duration_time: schedule_duration_time,
          startDate: startDate,
          endDate: endDate,
          queue_detail_id: queue_detail_id
        })
        waiting_qty = waiting_qty + rows_wait.length

        if (current_time_unix >= start_time_unix && current_time_unix <= end_time_unix) {
          // ถ้าเวลาปัจจุบันอยู่ในช่วงเวลาที่แพยท์ออกตรวจ
          if (rows_wait.length === parseInt(schedule_time.med_schedule_time_qty)) {
            // ถ้าคิวเต็ม
            if (schedule_times[i + 1]) {
              continue
            } else {
              waiting_qty = waiting_qty
              duration_time = "คิวเสริม"
            }
          } else {
            // ถ้าคิวยังไม่เต็ม
            waiting_qty = waiting_qty
            duration_time = schedule_duration_time
            break
          }
        } else {
          if (start_time_unix >= current_time_unix) {
            // ถ้าช่วงเวลาแพทย์ออกตรวจมากกว่าเวลาปัจจุบัน
            if (rows_wait.length === parseInt(schedule_time.med_schedule_time_qty)) {
              // ถ้าคิวเต็ม
              if (schedule_times[i + 1]) {
                continue
              } else {
                waiting_qty = waiting_qty
                duration_time = "คิวเสริม"
              }
            } else {
              // ถ้าคิวยังไม่เต็ม
              waiting_qty = waiting_qty
              duration_time = schedule_duration_time
              break
            }
          }
        }
      }
    }
    return {
      waiting_qty: waiting_qty,
      duration_time: duration_time
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param {object} patient_info
 * @param {number} service_point_id
 * @param {number} service_type_id
 * @param {object} service
 */
exports.registerMedicineHandler = async (ctx, next) => {
  try {
    const bodyParams = ctx.request.body
    ctx.assert(bodyParams.patient_info, 400, "invalid params.")
    ctx.assert(bodyParams.service, 400, "invalid params.")
    ctx.assert(bodyParams.service_point_id, 400, "invalid params.")
    ctx.assert(bodyParams.service_type_id, 400, "invalid params.")

    const patient_info = get(bodyParams, ["patient_info"]) // ข้อมูลผู้ป่วย
    const service = get(bodyParams, ["service"], null) // แผนกหรือประเภทผู้ป่วยที่เลือก
    const service_point_id = get(bodyParams, ["service_point_id"], null) // จุดออกบัตรคิว
    const service_type_id = get(bodyParams, ["service_type_id"], null) // ประเภทคิวบริการ

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    // ค้นหาข้อมูลผู้ป่วยที่ลงทะเบียนล่าสุด
    const oldPatient = await queueService.findOldPatient({
      hn: patient_info.hn,
      startDate: startDate,
      endDate: endDate
    })

    const modelService = await queueService.findModelServiceById(service.service_id) // แผนก
    ctx.assert(modelService, 404, "ไม่พบข้อมูลแผนก.")

    const modelServiceGroup = await queueService.findModelServiceGroupById(modelService.service_group_id) // กลุ่มแผนก
    ctx.assert(modelServiceGroup, 404, "ไม่พบข้อมูลกลุ่มแผนก.")

    const modelPrefix = await queueService.findModelPrefixById(modelService.prefix_id) // ตัวอักษรหน้าเลขคิว
    ctx.assert(modelPrefix, 404, "ไม่พบข้อมูลตัวอักษรหน้าเลขคิว.")

    const schedule_day = moment(utils.getCurrentDate()).format("E")
    const schedule = await queueService.findOneScheduleSetting({
      service_id: modelService.service_id,
      schedule_day: schedule_day,
      schedule_active: 1
    })
    if (!isEmpty(schedule)) {
      const current_date = moment(utils.getCurrentDate()).format("YYYY-MM-DD")
      const current_time_unix = parseFloat(moment(utils.getCurrentDate()).format("X"))
      const service_start_time_unix = parseFloat(moment(`${current_date} ${schedule.start_time}`).format("X"))
      const service_end_time_unix = parseFloat(moment(`${current_date} ${schedule.end_time}`).format("X"))

      // ตรวจสอบเวลาให้บริการ
      let service_online = false
      if (current_time_unix >= service_start_time_unix && current_time_unix <= service_end_time_unix) {
        service_online = true
      }
      if (!service_online) {
        ctx.throw(
          400,
          `ไม่สามารถทำรายการได้ เนื่องจากแผนก ${modelService.service_name} ยังไม่ได้เปิดให้บริการในเวลานี้!`
        )
      }
    }
    // ไอดีผู้ลงทะเบียน
    const userId = ctx.session.user.id
    let appoint_selected = null
    // ออกเลขคิวต่อเนื่องแผนกอื่นที่มี prefix เดียวกันหรือไม่?
    const is_prefix_succession = modelService.prefix_succession === 1

    // ถ้ายังไม่เคยลงทะเบียน
    let patient = oldPatient
    // ถ้ายังไม่เคยลงทะเบียน
    if (isEmpty(oldPatient)) {
      const attributes = {
        hn: get(patient_info, ["hn"], ""),
        vn: get(patient_info, ["vn"], ""),
        cid: get(patient_info, ["CardID"], ""),
        passid: get(patient_info, ["passid"], ""),
        title: get(patient_info, ["title"], ""),
        firstname: get(patient_info, ["firstname"], ""),
        lastname: get(patient_info, ["lastname"], ""),
        fullname: get(patient_info, ["name"], ""),
        birth_date: null,
        age: get(patient_info, ["age"], null),
        blood_group: get(patient_info, ["blood_group"], ""),
        nation: get(patient_info, ["nation"], ""),
        fulladdress: "",
        occ: get(patient_info, ["occ"], ""),
        maininscl_name: "",
        subinscl_name: "",
        created_at: utils.createdAt(),
        updated_at: utils.updatedAt(),
        created_by: userId,
        updated_by: userId
      }
      const patientId = await queueService.insertPatient(attributes)
      patient = await queueService.findPatientById(patientId)
    }
    ctx.assert(patient, 404, "ไม่พบข้อมูลผู้ป่วย.")

    const isAppointSplit = modelService.appoint_split === 1 // แยกคิวนัด true
    let prefix_code = modelPrefix.prefix_code

    if (isAppointSplit) {
      if (!isEmpty(appoint_selected)) {
        const AppointPrefixCode = await queueService.findModelPrefixById(modelService.appoint_prefix_id)
        prefix_code = modelPrefix.prefix_code + get(AppointPrefixCode, ["prefix_code"], "A")
      } else {
        const NoAppointPrefixCode = await queueService.findModelPrefixById(modelService.no_appoint_prefix_id)
        prefix_code = modelPrefix.prefix_code + get(NoAppointPrefixCode, ["prefix_code"], "B")
      }
    }
    // แผนกที่ลงทะเบียนวันนี้
    // คิวที่ลงทะเบียนวันนี้
    const queueToday = await queueService.getQueueToday({
      startDate: startDate,
      endDate: endDate,
      service_group_id: modelServiceGroup.service_group_id,
      service_id: modelService.service_id,
      hn: patient.hn,
      service_type_id: service_type_id
    })
    if (!isEmpty(queueToday)) {
      ctx.throw(400, "ไม่สามารถออกคิวซ้ำได้ เนื่องจากได้ออกคิวแล้ว!")
    }

    // หาเลขคิวล่าสุด
    const lastQueue = await queueService.findLastQueue({
      service_group_id: modelServiceGroup.service_group_id,
      service_id: modelService.service_id,
      prefix_id: modelService.prefix_id,
      appoint_split: modelService.appoint_split,
      prefix_succession: modelService.prefix_succession,
      updated_at: moment(utils.getCurrentDate()).format("YYYY-MM-DD")
    })
    let last_number = "" // เลขคิวล่าสุด

    // ถ้ามีเลขคิวล่าสุด
    if (!isEmpty(lastQueue)) {
      last_number = lastQueue.number
    }

    // เลขคิวถัดไป
    const nextQueue = utils.runningQueueNumber({
      digit: modelService.service_num_digit,
      last_number: last_number,
      prefix: prefix_code
    })

    const queueAttributes = {
      queue_no: nextQueue,
      patient_id: patient.patient_id, // ไอดีผู้ป่วย
      queue_type_id: 1, // ประเภทคิว default คิวทั่วไป
      coming_type_id: 1, // วิธีการมา
      appoint_id: null, // ไอดีนัด
      service_point_id: service_point_id, // จุดออกบัตรคิว
      created_at: utils.createdAt(),
      updated_at: utils.updatedAt(),
      created_by: userId,
      updated_by: userId
    }
    const queueId = await queueService.insertQueue(queueAttributes)
    const modelQueue = await queueService.findModelQueue({ queue_id: queueId })

    // ถ้ายังไม่มีเลขคิวล่าสุด ให้บันทึกรายการใหม่
    if (isEmpty(lastQueue)) {
      let autonumberAttributes = {
        prefix_id: modelPrefix.prefix_id,
        service_group_id: modelServiceGroup.service_group_id,
        appoint_split: modelService.appoint_split,
        prefix_succession: modelService.prefix_succession,
        number: nextQueue,
        updated_at: moment(utils.getCurrentDate()).format("YYYY-MM-DD")
      }
      // ถ้าไม่ออกเลขคิวต่อเนื่องแผนกอื่น
      if (!is_prefix_succession) {
        autonumberAttributes = utils.updateObject(autonumberAttributes, {
          service_id: modelService.service_id
        })
      }
      await queueService.insertAutoNumber(autonumberAttributes)
    } else {
      // อัพเดทเลขคิวล่าสุด
      await queueService.updateAutoNumber({ auto_number_id: lastQueue.auto_number_id }, { number: nextQueue })
    }
    ctx.assert(modelQueue, 400, "เกิดข้อผิดพลาดในการลงทะเบียนคิว.")

    // ค้นหาข้อมูลคิว
    let modelQueueDetail = await queueService.findModelQueueDetail({
      queue_id: modelQueue.queue_id,
      service_group_id: modelServiceGroup.service_group_id,
      service_id: modelService.service_id
    })

    // ถ้ายังไม่เคยลงทะเบียน
    if (isEmpty(modelQueueDetail)) {
      const attributes = {
        queue_id: modelQueue.queue_id,
        service_group_id: modelServiceGroup.service_group_id,
        service_id: modelService.service_id,
        queue_status_id: 1,
        service_type_id: service_type_id,
        created_by: userId,
        updated_by: userId,
        created_at: utils.createdAt(),
        updated_at: utils.updatedAt()
      }
      const queue_detail_id = await queueService.insertQueueDetail(attributes)
      modelQueueDetail = await queueService.findModelQueueDetail({ queue_detail_id: queue_detail_id })
    } else {
      // อัพเดทข้อมูลคิว
      await queueService.updateQueueDetail(
        { queue_detail_id: modelQueueDetail.queue_detail_id },
        { updated_at: utils.updatedAt(), updated_by: userId }
      )
    }
    // คำนวณคิวรอและระยะเวลารอคอย
    const calculate = await this.calculateMedicine(ctx, {
      service_id: modelService.service_id,
      queue_id: modelQueue.queue_id
    })

    // อัพเดทข้อมูลคิว
    await queueService.updateQueueDetail(
      { queue_detail_id: modelQueueDetail.queue_detail_id },
      {
        updated_at: utils.updatedAt(),
        updated_by: userId,
        waiting_qty: calculate.waiting_qty,
        duration_time: calculate.duration_time,
        std_time: calculate.std_time
      }
    )
    modelQueueDetail = await queueService.findModelQueueDetail({
      queue_detail_id: modelQueueDetail.queue_detail_id
    })

    ctx.body = {
      service: modelService,
      service_group: modelServiceGroup,
      queue: modelQueue,
      patient_info: patient,
      queue_detail: modelQueueDetail,
      user_picture: "",
      client_ip: ctx.request.ip
    }
  } catch (error) {
    ctx.throw(error)
  }
}

exports.calculateMedicine = async (ctx, params) => {
  try {
    const current_datetime = moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const service_id = get(params, ["service_id"], "")
    const queue_id = get(params, ["queue_id"], null)

    const queueService = new QueueService({ db_queue: ctx.db_queue })

    const waiting_qty = await queueService.getWaitingCalculateMedicine({
      service_id: service_id,
      queue_id: queue_id,
      created_at_unix: parseFloat(moment(utils.getCurrentDate()).format("X")),
      startDate: startDate,
      endDate: endDate
    })
    let std_time = 0 // เวลารอคอยเฉลี่ย(นาที)

    // ถ้ามีจำนวนคิวรอ
    if (waiting_qty.length > 0) {
      std_time = waiting_qty.length * 1
    }

    // ช่วงเวลาที่จะได้รับบริการ
    let avg_date = moment(utils.getCurrentDate()).add(std_time, "minutes")
    let avg_time = moment(avg_date).format("HH:mm")
    // เอาเวลาที่คำนวณได้มา - 5 , + 10 นาที
    const start_time = moment(avg_date)
      .subtract(5, "minutes")
      .format("HH:mm")
    const end_time = moment(avg_date)
      .add(10, "minutes")
      .format("HH:mm")
    const duration_time = String(`${start_time}-${end_time}`).replace(/\s/g, "")
    return {
      waiting_qty: waiting_qty.length,
      duration_time: duration_time,
      std_time: std_time,
      avg_time: avg_time
    }
  } catch (error) {
    ctx.throw(error)
  }
}
