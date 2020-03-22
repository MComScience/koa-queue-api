"use strict"

const AppointmentService = require("../services/appointment.service")
const QueueService = require("../services/queue.service")
const utils = require("../utils")
const get = require("lodash/get")
const isEmpty = require("is-empty")
const moment = require("moment")
moment.locale("th")

/**
 * @method GET
 */
exports.formOptionsHandler = async (ctx, next) => {
  try {
    const mssql = ctx.mssql
    const appointmentService = new AppointmentService({ mssql: mssql })
    const dept_groups = await appointmentService.getDeptGroups()
    const mapping_docc = []
    const doctors = []
    for (let i = 0; i < dept_groups.length; i++) {
      const dept_group = dept_groups[i]
      const depts = await appointmentService.getAppointDeptDoccWithDeptCode(dept_group.deptCode)
      const docc = utils.trimValue(depts)
      mapping_docc.push(
        utils.updateObject(utils.trimValue(dept_group), {
          docc: docc
        })
      )
      doctors.push(...docc)
    }
    ctx.body = {
      dept_groups: mapping_docc,
      doctors: doctors,
      current_date: utils.getCurrentDateFormat("YYYY-MM-DD")
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} appoint_deptcode
 * @param {string} appoint_date
 * @param {string} appoint_docc
 */
exports.appointDataOfDoctor = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.appoint_deptcode, 400, "invalid params.")
    ctx.assert(ctx.query.appoint_date, 400, "invalid params.")

    let appoint_date = get(ctx.query, ["appoint_date"])
    ctx.assert(appoint_date, 400, "กรุณาระบุวันที่.")

    const condition = {}
    const mssql = ctx.mssql
    const appointmentService = new AppointmentService({ mssql: mssql })

    appoint_date = appoint_date.split("-")
    const ap_year = parseInt(appoint_date[0]) + 543
    const ap_month = appoint_date[1]
    const ap_day = appoint_date[2]
    appoint_date = `${ap_year}${ap_month}${ap_day}`
    condition["Appoint.appoint_date"] = appoint_date

    if (ctx.query.appoint_docc) {
      condition["Appoint.doctor"] = utils.sprintf(`% 6s`, ctx.query.appoint_docc)
    }
    if (ctx.query.appoint_deptcode) {
      condition["Appoint.pre_dept_code"] = ctx.query.appoint_deptcode
    }
    const appoints = await appointmentService.getAppointDataOfDoctor(condition)
    ctx.body = utils.trimValue(appoints, ["keyin_time", "maker"])
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} hn
 * @param {string} appoint_date
 */
exports.appointDataOfPatient = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.hn, 400, "invalid params.")

    const mssql = ctx.mssql
    const db_queue = ctx.db_queue

    const appointmentService = new AppointmentService({ mssql: mssql })
    const queueService = new QueueService({ db_queue: db_queue })

    let patient = await appointmentService.getPatient({ "v_patient_detail.hn": utils.sprintf(`% 6s`, ctx.query.hn) })
    ctx.assert(patient, 404, "ไม่พบข้อมูลผู้ป่วย.")

    const queuePatient = await queueService.findOnePatient({ hn: ctx.query.hn })
    let user_picture = "/images/patient.png"
    if (!isEmpty(queuePatient)) {
      const fileStorage = await queueService.findOneModelStorage({
        ref_id: queuePatient.patient_id,
        ref_table: "tbl_patient"
      })
      if (!isEmpty(fileStorage)) {
        user_picture = `${fileStorage.base_url}${fileStorage.path.replace(/\\/g, "/")}`
      }
    }

    patient = utils.updateObject(patient, {
      user_picture: user_picture
    })
    let condition = {}
    let appoint_date = get(ctx.query, ["appoint_date"])
    if (appoint_date) {
      appoint_date = appoint_date.split("-")
      const ap_year = parseInt(appoint_date[0]) + 543
      const ap_month = appoint_date[1]
      const ap_day = appoint_date[2]
      appoint_date = `${ap_year}${ap_month}${ap_day}`
      condition["Appoint.appoint_date"] = appoint_date
    }
    condition["Appoint.hn"] = utils.sprintf(`% 7s`, ctx.query.hn)
    const appoints = await appointmentService.getAppointDataOfPatient(condition)

    ctx.body = {
      appoints: utils.trimValue(appoints, ["keyin_time", "maker"]),
      patient: utils.trimValue(patient)
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} hn
 * @param {string} vn
 */
exports.searchPatientHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.hn, 400, "invalid params.")

    const mssql = ctx.mssql
    const db_queue = ctx.db_queue

    const appointmentService = new AppointmentService({ mssql: mssql })
    const queueService = new QueueService({ db_queue: db_queue })

    let patient = await appointmentService.getPatient({ hn: utils.sprintf(`% 7s`, ctx.query.hn) })
    ctx.assert(patient, 404, "ไม่พบข้อมูลผู้ป่วย.")

    const queuePatient = await queueService.findOnePatient({ hn: ctx.query.hn })
    let user_picture = "/images/patient.png"
    if (!isEmpty(queuePatient)) {
      const fileStorage = await queueService.findOneModelStorage({
        ref_id: queuePatient.patient_id,
        ref_table: "tbl_patient"
      })
      if (!isEmpty(fileStorage)) {
        user_picture = `${fileStorage.base_url}${fileStorage.path.replace(/\\/g, "/")}`
      }
    }

    patient = utils.updateObject(patient, {
      user_picture: user_picture
    })
    const deptq_d = await appointmentService.getDeptq_d({
      hn: utils.sprintf(`% 7s`, ctx.query.hn),
      regNo: ctx.query.vn
    })

    ctx.body = {
      patient: utils.trimValue(patient, ["bday"]),
      deptq_d: deptq_d ? utils.trimValue(deptq_d) : null
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} hn
 * @param {string} doctor
 * @param {string} appoint_date
 */
exports.searchMedScheduleHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.hn, 400, "invalid params.")
    ctx.assert(ctx.query.doctor, 400, "invalid params.")
    ctx.assert(ctx.query.appoint_date, 400, "invalid params.")

    const mssql = ctx.mssql
    const db_queue = ctx.db_queue

    const appointmentService = new AppointmentService({ mssql: mssql, db_queue: db_queue })
    const queueService = new QueueService({ db_queue: db_queue })

    const docc = await queueService.findModelDoctor({ doctor_code: ctx.query.doctor })
    ctx.assert(docc, 404, "ไม่พบข้อมูลแพทย์ในระบบคิว.")

    let patient = await appointmentService.getPatient({ hn: utils.sprintf(`% 7s`, ctx.query.hn) })
    ctx.assert(patient, 404, "ไม่พบข้อมูลผู้ป่วย.")

    const med_schedules = await appointmentService.findAllMedScheduleTime({
      "tbl_doctor.doctor_code": ctx.query.doctor,
      "tbl_med_schedule.schedule_date": ctx.query.appoint_date
    })
    ctx.body = {
      med_schedules: med_schedules,
      docc: docc,
      patient: utils.trimValue(patient, ["bday"])
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST or PUT
 * @param {object} oldAppoint
 * @param {string} action_type
 */
exports.saveAppointHandler = async (ctx, next) => {
  try {
    const bodyParams = ctx.request.body
    const action_type = get(bodyParams, ["action_type"], "")

    const mssql = ctx.mssql
    const db_queue = ctx.db_queue

    const appointmentService = new AppointmentService({ mssql: mssql, db_queue: db_queue })

    let appoint_date = get(bodyParams, ["appoint_date"], "")
    if (appoint_date) {
      appoint_date = appoint_date.split("-")
      const ap_year = parseInt(appoint_date[0]) + 543
      const ap_month = appoint_date[1]
      const ap_day = appoint_date[2]
      appoint_date = `${ap_year}${ap_month}${ap_day}` // Ex. 25630302
    }

    if (action_type === "insert") {
      const old_appoint = await appointmentService.findAllAppoint({
        "Appoint.hn": utils.sprintf(`% 7s`, bodyParams.hn),
        "Appoint.doctor": utils.sprintf(`% 6s`, bodyParams.doctor),
        "Appoint.appoint_date": appoint_date,
        "Appoint.appoint_time_from": bodyParams.appoint_time_from,
        "Appoint.appoint_time_to": bodyParams.appoint_time_to,
        "Appoint.pre_dept_code": bodyParams.pre_dept_code,
        "Appoint.maker": "queue online"
      })
      if (!isEmpty(old_appoint)) {
        ctx.throw(400, "ไม่สามารถทำรายการได้ เนื่องจากคุณมีรายการนัดตามวัน,เวลา แผนก แพทย์ ที่เลือกอยู่แล้ว.")
      }

      const appoint = {
        app_type: "A",
        doctor: utils.sprintf(`% 6s`, bodyParams.doctor),
        hn: utils.sprintf(`% 7s`, bodyParams.hn),
        appoint_date: appoint_date,
        appoint_time_from: bodyParams.appoint_time_from,
        appoint_time_to: bodyParams.appoint_time_to,
        appoint_note: bodyParams.appoint_note,
        pre_dept_code: bodyParams.pre_dept_code,
        maker: "queue online",
        keyin_time: moment(utils.getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
      }
      const ap = await appointmentService.insertAppoint(appoint)
      ctx.body = {
        message: "บันทึกรายการสำเร็จ!",
        appoint: ap
      }
    } else {
      const old_appoint = bodyParams.oldAppoint
      const appoint = {
        doctor: utils.sprintf(`% 6s`, bodyParams.doctor),
        appoint_date: appoint_date,
        appoint_time_from: bodyParams.appoint_time_from,
        appoint_time_to: bodyParams.appoint_time_to,
        appoint_note: bodyParams.appoint_note,
        pre_dept_code: bodyParams.pre_dept_code,
        maker: "queue online"
      }
      const ap = await appointmentService.updateAppoint(appoint, {
        hn: utils.sprintf(`% 7s`, old_appoint.hn),
        doctor: utils.sprintf(`% 6s`, old_appoint.doctor),
        appoint_date: old_appoint.appoint_date,
        appoint_time_from: old_appoint.appoint_time_from,
        appoint_time_to: old_appoint.appoint_time_to,
        pre_dept_code: old_appoint.pre_dept_code,
        maker: "queue online"
      })
      ctx.body = {
        message: "บันทึกรายการสำเร็จ!",
        appoint: ap
      }
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} hn
 * @param {string} doctor
 * @param {string} appoint_date
 * @param {string} pre_dept_code
 */
exports.updateAppointHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.hn, 400, "invalid params.")
    ctx.assert(ctx.query.doctor, 400, "invalid params.")
    ctx.assert(ctx.query.appoint_date, 400, "invalid params.")
    ctx.assert(ctx.query.pre_dept_code, 400, "invalid params.")

    const y = ctx.query.appoint_date.substring(0, 4)
    const m = ctx.query.appoint_date.substring(4, 6)
    const d = ctx.query.appoint_date.substring(6)
    const schedule_date = `${parseInt(y) - 543}-${m}-${d}`

    const mssql = ctx.mssql
    const db_queue = ctx.db_queue

    const appointmentService = new AppointmentService({ mssql: mssql, db_queue: db_queue })
    const queueService = new QueueService({ db_queue: db_queue })

    const med_schedules = await appointmentService.findAllMedScheduleTime({
      "tbl_doctor.doctor_code": ctx.query.doctor,
      "tbl_med_schedule.schedule_date": schedule_date
    })

    let patient = await appointmentService.getPatient({ hn: utils.sprintf(`% 7s`, ctx.query.hn) })
    ctx.assert(patient, 404, "ไม่พบข้อมูลผู้ป่วย.")

    const queuePatient = await queueService.findOnePatient({ hn: ctx.query.hn })
    let user_picture = "/images/patient.png"
    if (!isEmpty(queuePatient)) {
      const fileStorage = await queueService.findOneModelStorage({
        ref_id: queuePatient.patient_id,
        ref_table: "tbl_patient"
      })
      if (!isEmpty(fileStorage)) {
        user_picture = `${fileStorage.base_url}${fileStorage.path.replace(/\\/g, "/")}`
      }
    }

    patient = utils.updateObject(patient, {
      user_picture: user_picture
    })
    ctx.body = {
      schedule_date: schedule_date,
      med_schedules: med_schedules,
      patient: utils.trimValue(patient, ["bday"])
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST or PUT
 */
exports.saveHolidayHandler = async (ctx, next) => {
  try {
    const bodyParams = ctx.request.body
    const action_type = get(bodyParams, ["action_type"], "")
    ctx.assert(action_type, 400, "invalid params.")

    const mssql = ctx.mssql
    const db_queue = ctx.db_queue
    const user = ctx.session.user

    const appointmentService = new AppointmentService({ mssql: mssql, db_queue: db_queue })

    if (action_type === "insert") {
      const attributes = {
        holiday_date: bodyParams.holiday_date,
        title: bodyParams.title,
        start: "00:00:00",
        end: "23:59:59",
        background_color: bodyParams.background_color,
        created_at: utils.createdAt(),
        updated_at: utils.updatedAt(),
        created_by: user.id,
        updated_by: user.id
      }
      await appointmentService.insertHoliday(attributes)
      ctx.body = {
        message: "บันทึกรายการสำเร็จ!"
      }
    } else {
      const attributes = {
        holiday_date: bodyParams.holiday_date,
        title: bodyParams.title,
        start: "00:00:00",
        end: "23:59:59",
        background_color: bodyParams.background_color,
        updated_at: utils.updatedAt(),
        updated_by: user.id
      }
      await appointmentService.updateHoliday(attributes, { id: bodyParams.id })
      ctx.body = {
        message: "บันทึกรายการสำเร็จ!"
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
exports.calendarEventsHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.startDate, 400, "invalid params.")
    ctx.assert(ctx.query.endDate, 400, "invalid params.")

    const mssql = ctx.mssql
    const db_queue = ctx.db_queue

    const appointmentService = new AppointmentService({ mssql: mssql, db_queue: db_queue })
    const holidays = await appointmentService.findAllHoliday({
      startDate: ctx.query.startDate,
      endDate: ctx.query.endDate
    })
    const events = holidays.map(row => {
      return utils.updateObject(row, {
        start: moment(`${moment(row.holiday_date).format("YYYY-MM-DD")} ${row.start}`).format("YYYY-MM-DDTHH:mm:ss"),
        end: moment(`${moment(row.holiday_date).format("YYYY-MM-DD")} ${row.end}`).format("YYYY-MM-DDTHH:mm:ss"),
        textColor: "#ffffff",
        allDay: true,
        extendedProps: row
      })
    })
    ctx.body = events
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method DELETE
 */
exports.deleteHolidayHandler = async (ctx, next) => {
  try {
    ctx.assert(ctx.query.id, 400, "invalid params.")

    const mssql = ctx.mssql
    const db_queue = ctx.db_queue

    const appointmentService = new AppointmentService({ mssql: mssql, db_queue: db_queue })
    await appointmentService.deleteHoliday(ctx.query.id)
    ctx.body = {
      message: "ลบรายการสำเร็จ!"
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method DELETE
 */
exports.deleteAppointHandler = async (ctx, next) => {
  try {
    const bodyParams = ctx.request.body
    const mssql = ctx.mssql
    const db_queue = ctx.db_queue

    const appointmentService = new AppointmentService({ mssql: mssql, db_queue: db_queue })
    await appointmentService.deleteAppoint({
      hn: utils.sprintf(`% 7s`, bodyParams.hn),
      doctor: utils.sprintf(`% 6s`, bodyParams.doctor),
      appoint_date: bodyParams.appoint_date,
      appoint_time_from: bodyParams.appoint_time_from,
      appoint_time_to: bodyParams.appoint_time_to,
      pre_dept_code: bodyParams.pre_dept_code,
      maker: "queue online"
    })
    ctx.body = {
      message: "ลบรายการสำเร็จ!"
    }
  } catch (error) {
    ctx.throw(error)
  }
}
