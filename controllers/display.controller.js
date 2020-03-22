"use strict"

const DisplayService = require("../services/display.service")
const KioskService = require("../services/kiosk.service")
const utils = require("../utils")
const unserialize = require("locutus/php/var/unserialize")
const get = require("lodash/get")
const moment = require("moment")
moment.locale("th")

/**
 * @method GET
 */
exports.getDisplayListHandler = async (ctx, next) => {
  try {
    const displayService = new DisplayService({ db_queue: ctx.db_queue })
    const displays = await displayService.findAllDisplay()
    ctx.body = displays.map(display => {
      return utils.updateObject(display, {
        counter_service_ids: unserialize(display.counter_service_ids),
        service_ids: unserialize(display.service_ids)
      })
    })
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {number} id
 */
exports.getDisplayHandler = async (ctx, next) => {
  try {
    const id = ctx.query.id
    ctx.assert(id, 400, "invalid params.")

    const displayService = new DisplayService({ db_queue: ctx.db_queue })
    let display = await displayService.findModelDisplay(id)
    ctx.assert(display, 404, "ไม่พบข้อมูล.")

    ctx.body = utils.updateObject(display, {
      counter_service_ids: unserialize(display.counter_service_ids),
      service_ids: unserialize(display.service_ids)
    })
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {array} service_ids []
 * @param {array} counter_service_ids []
 */
exports.getQueueDisplayToday = async (ctx, next) => {
  try {
    let service_ids = get(ctx.query, ["service_ids"], "")
    let counter_service_ids = get(ctx.query, ["counter_service_ids"], "")
    const displayService = new DisplayService({ db_queue: ctx.db_queue })

    service_ids = service_ids.split(",")
    counter_service_ids = counter_service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()
    const params = {
      service_ids: service_ids,
      counter_service_ids: counter_service_ids,
      startDate: startDate,
      endDate: endDate
    }

    // คิวซักประวัติ
    const historys = await displayService.findDisplayToday(
      utils.updateObject(params, { service_type_id: [1], queue_status_id: 1 })
    )
    // คิวห้องตรวจ
    const examinations = await displayService.findDisplayToday(
      utils.updateObject(params, { service_type_id: [2], queue_status_id: 2 })
    )
    // คิวพัก
    const rows_hold = await displayService.findDisplayToday(
      utils.updateObject(params, { service_type_id: [1, 2], queue_status_id: 3 })
    )
    let hold = rows_hold
    if (rows_hold) {
      hold = rows_hold.map(r => r.queue_no)
    }
    ctx.body = {
      examinations: examinations,
      historys: historys,
      hold: hold
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {Array} service_ids
 * @param {Array} counter_service_ids
 */
exports.getDisplayMedicine = async (ctx, next) => {
  try {
    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()
    let service_ids = ctx.query.service_ids
    let counter_service_ids = ctx.query.counter_service_ids
    ctx.assert(service_ids, 400, "invalid params.")
    ctx.assert(counter_service_ids, 400, "invalid params.")

    service_ids = service_ids.split(",")
    counter_service_ids = counter_service_ids.split(",")

    const displayService = new DisplayService({ db_queue: ctx.db_queue })

    const params = {
      queue_status_id: 1,
      service_ids: service_ids,
      counter_service_ids: counter_service_ids,
      startDate: startDate,
      endDate: endDate
    }
    const rows_medicine = await displayService.findDisplayMedicine(params)
    const rows_hold = await displayService.findDisplayMedicine(utils.updateObject(params, { queue_status_id: 3 }))
    const hold = rows_hold.map(row => row.queue_no)

    const rows_times = await this.getDataDisplayTimeRanges(service_ids, ctx, startDate, endDate)

    ctx.body = {
      rows_medicine: rows_medicine,
      rows_hold: rows_hold,
      hold: hold,
      rows_times: rows_times
    }
  } catch (error) {
    ctx.throw(error)
  }
}

exports.getDataDisplayTimeRanges = async (service_ids = [], ctx, startDate, endDate) => {
  try {
    const kioskService = new KioskService({ db_queue: ctx.db_queue })
    const time_ranges = utils.getTimeRanges()
    const services = await kioskService.findServices(service_ids)
    const currentDate = moment(utils.getCurrentDate()).format("YYYY-MM-DD")
    const result = []
    services.map(async service => {
      const params = {
        startDate: startDate,
        endDate: endDate,
        service_id: service.service_id
      }
      const rows = await kioskService.findQueueWaiting(params)
      time_ranges.map(time => {
        const date1 = moment(`${currentDate} ${time.start_time}:00`).format("YYYY-MM-DD HH:mm:ss")
        const date = moment(date1).add("1", "minutes")
        const start_time_unix = parseFloat(moment(date).format("X"))
        const end_time_unix = parseFloat(moment(`${currentDate} ${time.end_time}:00`).format("X"))

        const arr_times = []
        const queue_number = []

        rows.map(queue => {
          if (queue.duration_time && queue.duration_time !== "คิวเสริม") {
            const duration_time = queue.duration_time
            let start_date = moment(`${currentDate} ${time.start_time}:00`).format("YYYY-MM-DD HH:mm:ss")
            start_date = moment(start_date).add("5", "minutes")
            const std_time = moment(start_date).format("HH:mm") // เวลาเริ่มต้น +5 นาที จะได้เวลารอคอยที่คำนวณได้
            const std_time_unix = parseFloat(moment(start_date).format("X"))

            const current_time_unix = parseFloat(moment(utils.getCurrentDate()).format("X"))
            const end_duration_time_unix = parseFloat(moment(`${currentDate} ${time.end_time}:00`).format("X"))

            if (
              std_time_unix >= start_time_unix &&
              std_time_unix <= end_time_unix &&
              end_duration_time_unix >= current_time_unix
            ) {
              arr_times.push({
                queue_no: queue.queue_no,
                duration_time: queue.duration_time,
                std_time: std_time
              })
              queue_number.push(queue.queue_no)
            }
          }
        })

        if (arr_times.length) {
          const count = queue_number.length
          let display_number = `${queue_number[0]}`
          if (count >= 2) {
            display_number = `${queue_number[0]}-${queue_number[1]}`
          }
          result.push({
            display_number: display_number,
            display_time: `${time.start_time}-${time.end_time}`,
            data: arr_times
          })
        }
      })
    })
    return Promise.resolve(result)
  } catch (error) {
    ctx.throw(error)
  }
}

exports.getDisplayTimesMedicine = async (ctx, next) => {
  try {
    let service_ids = ctx.query.service_ids
    ctx.assert(service_ids, 400, "invalid params.")
    service_ids = service_ids.split(",")

    const startDate = utils.startDateNow()
    const endDate = utils.endDateNow()

    const rows_times = await this.getDataDisplayTimeRanges(service_ids, ctx, startDate, endDate)
    ctx.body = rows_times
  } catch (error) {
    ctx.throw(error)
  }
}
