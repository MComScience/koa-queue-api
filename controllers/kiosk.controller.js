"use strict"

const sprintf = require("../utils/sprintf")
const KioskService = require("../services/kiosk.service")
const FloorService = require("../services/floor.service")
const _ = require("lodash")
const utils = require("../utils")
const moment = require("moment")
const { savePatientQueue } = require("../jobs/queues")
const get = require("lodash/get")
const isEmpty = require("is-empty")
const unserialize = require("locutus/php/var/unserialize")
moment.locale("th")

const FOUND_MORE_THAN_HN = "พบข้อมูลผู้รับบริการมากกว่า 1 HN กรุณาติดต่อห้องบัตร"
const USER_NOT_FOUND = "ไม่พบข้อมูลผู้รับบริการ กรุณาติดต่อห้องบัตร"
const FORFIGN_SERVICE_RECIPIENTS = "ผู้รับบริการต่างชาติ กรุณาติดต่อห้องบัตร"

/**
 * @method GET
 * @param {string} q cid or HN.
 */
exports.getPatientProfile = async (ctx, next) => {
  const mssql = ctx.mssql
  const kioskService = new KioskService({ mssql: mssql })
  try {
    ctx.assert(ctx.params.q, 400, "invalid params.")
    let q = ctx.params.q.replace(/\s+/g, "")
    const appoint_date = ctx.params.date || moment(utils.getCurrentDate()).format("YYYY-MM-DD")

    let profiles = []
    if (q.length === 13) {
      // ค้นหาโดยเลขบัตร
      profiles = await kioskService.findPatientByCardId(q)
    } else {
      // ค้นหาโดย HN
      // q = sprintf(`% 7s`, q)
      profiles = await kioskService.findPatientByHN(q)
    }
    // check data
    if (!profiles.length) {
      // save log
      ctx.log.info({ userId: ctx.session.user.id, message: USER_NOT_FOUND })
      // throw error
      ctx.throw(404, USER_NOT_FOUND)
    } else if (profiles.length > 1) {
      // save log
      ctx.log.info({ userId: ctx.session.user.id, message: FOUND_MORE_THAN_HN })
      // throw error
      ctx.throw(400, FOUND_MORE_THAN_HN)
    }

    // กรณีค้นหาด้วย HN
    if (q.length < 13) {
      const duplicates = this.getDuplicateHN(profiles)
      // ตรวจสอบข้อมูลว่ามี hn มากกว่า 1 hn หรือไม่
      if (duplicates.length) {
        // save log
        ctx.log.info({ userId: ctx.session.user.id, message: FOUND_MORE_THAN_HN })
        // throw error
        ctx.throw(400, FOUND_MORE_THAN_HN)
      }
    }
    // ข้อมูลผู้ป่วย
    const profile = utils.trimValue(profiles[0])
    // คนต่างประเทศ
    if (profile.nation_status === "0") ctx.throw(400, FORFIGN_SERVICE_RECIPIENTS)
    // ตรวจสอบว่า visit ล่าสุดน้อยกว่า 5 ปีหรือไม่
    const last_opd_h = await kioskService.getMaxOPD(profile.hn)
    if (last_opd_h) {
      const y = parseInt(last_opd_h.registDate.substring(0, 4)) - 543
      const m = last_opd_h.registDate.substring(4, 6)
      const d = last_opd_h.registDate.substring(6, 8)
      let last_visit = `${y}-${m}-${d}`
      const a = moment(utils.getCurrentDate())
      const b = moment(last_visit)
      last_visit = a.diff(b, "years")
      if (last_visit >= 5) {
        // throw error
        ctx.throw(400, "ข้อมูลรับบริการล่าสุดเก่ากว่า 5 ปี กรุณาติดต่อห้องบัตร")
      }
      // ตรวจสอบสถานะ admit
      if (last_opd_h.ipdStatus === "I") {
        ctx.throw(400, "ผู้ป่วยอยู่ในสถานะ Admit กรุณาติดต่อห้องบัตร")
      }
    }
    // รายการนัด
    const appoints = await kioskService.getAppoint(profile.hn, appoint_date)
    // success
    ctx.body = {
      ...profile,
      appoint: utils.trimValue(appoints)
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} q เลขบัตรหรือ HN
 * @param {string} regisDate วันที่ลงทะเบียน
 */
exports.getVisitLastDept = async (ctx, next) => {
  const mssql = ctx.mssql
  const db_api_udh = ctx.db_api_udh
  const kioskService = new KioskService({ mssql: mssql, db_api_udh: db_api_udh })
  try {
    ctx.assert(ctx.query.q, 400, "invalid params.")
    let q = ctx.query.q.replace(/\s+/g, "")
    let regisDate = ctx.query.regisDate
    if (!regisDate) {
      regisDate =
        parseInt(moment(utils.getCurrentDate()).format("Y")) + 543 + moment(utils.getCurrentDate()).format("MMDD")
    }
    let profiles = []
    if (q.length === 13) {
      // ค้นหาโดยเลขบัตร
      profiles = await kioskService.findPatientByCardId(q)
    } else {
      // ค้นหาโดย HN
      // q = sprintf(`% 7s`, q)
      profiles = await kioskService.findPatientByHN(q)
    }
    // check data
    if (!profiles.length) {
      // save log
      ctx.log.info({ userId: ctx.session.user.id, message: USER_NOT_FOUND })
      // throw error
      ctx.throw(404, USER_NOT_FOUND)
    } else if (profiles.length > 1) {
      // save log
      ctx.log.info({ userId: ctx.session.user.id, message: FOUND_MORE_THAN_HN })
      // throw error
      ctx.throw(400, FOUND_MORE_THAN_HN)
    }
    // กรณีค้นหาด้วย HN
    if (q.length < 13) {
      const duplicates = this.getDuplicateHN(profiles)
      // ตรวจสอบข้อมูลว่ามี hn มากกว่า 1 hn หรือไม่
      if (duplicates.length) {
        // save log
        ctx.log.info({ userId: ctx.session.user.id, message: FOUND_MORE_THAN_HN })
        // throw error
        ctx.throw(400, FOUND_MORE_THAN_HN)
      }
    }
    // ข้อมูลผู้ป่วย
    let profile = profiles[0]
    // สิทธิล่าสุด
    const lastDept = await kioskService.getLastDept(profile.hn, regisDate)
    if (!lastDept.length) ctx.throw(404, "ไม่พบข้อมูล Visit กรุณาติดต่อห้องบัตร")
    profile = Object.assign(profile, { vn: lastDept[0].vn })
    const right = {
      right_name: lastDept[0].pay_typedes || ""
    }
    // success
    ctx.body = {
      profile: profile,
      right: right,
      last_dept: lastDept
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} q เลข HN
 */
exports.getPtProfile = async (ctx, next) => {
  const mssql = ctx.mssql
  const kioskService = new KioskService({ mssql: mssql })
  try {
    ctx.assert(ctx.query.q, 400, "invalid params.")
    let q = ctx.query.q.replace(/\s+/g, "")
    let profiles = []
    if (q.length === 13) {
      // ค้นหาโดยเลขบัตร
      profiles = await kioskService.findPatientByCardId(q)
    } else {
      // ค้นหาโดย HN
      // q = sprintf(`% 7s`, q)
      profiles = await kioskService.findPatientByHN(q)
    }
    // check data
    if (!profiles.length) {
      // save log
      ctx.log.info({ userId: ctx.session.user.id, message: USER_NOT_FOUND })
      // throw error
      ctx.throw(404, USER_NOT_FOUND)
    } else if (profiles.length > 1) {
      // save log
      ctx.log.info({ userId: ctx.session.user.id, message: FOUND_MORE_THAN_HN })
      // throw error
      ctx.throw(400, FOUND_MORE_THAN_HN)
    }
    // ข้อมูลผู้ป่วย
    let profile = profiles[0]
    const regisDate =
      parseInt(moment(utils.getCurrentDate()).format("Y")) + 543 + moment(utils.getCurrentDate()).format("MMDD")
    const rightData = await kioskService.getLastRightDate(profile.hn, regisDate)
    let message_right = ""
    if (rightData) {
      message_right = rightData.pay_typedes
    }
    ctx.body = Object.assign(profile, { message_right: message_right })
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method POST
 * @param data ข้อมูลผู้ป่วย
 * @param right_data ข้อมูลสิทธิ
 */
exports.savePatientVisit = async (ctx, next) => {
  const mssql = ctx.mssql
  const db_api_udh = ctx.db_api_udh
  const kioskService = new KioskService({ mssql: mssql, db_api_udh: db_api_udh })
  try {
    const body = ctx.request.body
    ctx.assert(body.data, 400, "invalid data.")
    ctx.assert(body.right_data, 400, "invalid right_data.")
    ctx.assert(body.data.dept, 400, "invalid dept code.")

    let patient = body.data // ข้อมุลผู้ป่วย
    let rightData = body.right_data // ข้อมูลสิทธิ

    let hmain = get(rightData, ["hmain"]) || "" // รหัสหน่วยบริกำรที่รับกำรส่งต่อ
    const hmain_op = get(rightData, ["hmain_op"]) || "" // รหัสหน่วยบริกำรประจำ

    // hmian_op ไม่ใช่ รพ.อุดร ให้ใช่ op เป็น hmain
    if (hmain_op && hmain_op !== "10671") {
      hmain = hmain_op
    }
    // ข้อมูลสิทธิ
    rightData = utils.updateObject(rightData, {
      hmain: hmain,
      hmain_op: hmain_op,
      hsub: get(rightData, ["hsub"]) || "", // รหัสหน่วยบริกำรปฐมภูมิ
      purchaseprovince: get(rightData, ["purchaseprovince"]) || "" // รหัสจังหวัดที่ลงทะเบียน
    })
    // รหัสแผนก
    const dept_code = String(get(patient, ["dept"])).replace(/\D/g, "") || ""
    const cid = get(patient, ["cid"])
    const hn = get(patient, ["hn"])
    let doctor = get(patient, ["doctor"]) || ""
    /* if (doctor) {
      doctor = sprintf(`% 6s`, doctor)
    } */
    // ข้อมูลผู้ป่วย
    patient = utils.updateObject(patient, {
      dept: dept_code,
      doctor: doctor
    })
    const pt_profile = await kioskService.getPTProfile(cid || hn)
    // throw error
    ctx.assert(pt_profile, 404, USER_NOT_FOUND)

    const pay_type = await this.getPayType(patient, rightData, kioskService, ctx)
    if (get(pay_type, ["right_status"]) === 0) {
      ctx.throw(400, get(pay_type, ["message"]) || "เกิดข้อผิดพลาด กรุณาติดต่อห้องบัตร")
    }
    const ophh_data = await kioskService.insertOPD_H(patient)
    ctx.assert(ophh_data, 400, "ไม่สามารถดำเนินการเปิด Visit ได้ กรุณาติดต่อห้องบัตร")
    // create job
    const jobData = {
      ophh_data: ophh_data,
      patient: utils.trimValue(patient),
      hmain: hmain,
      hsub: rightData.hsub,
      pay_type: pay_type ? pay_type : null
    }
    savePatientQueue.add(jobData)
    // response
    ctx.body = {
      ophh_data: ophh_data,
      params: utils.trimValue(patient),
      hmain: hmain,
      hsub: rightData.hsub,
      pay_type: pay_type ? pay_type : null,
      message_right: get(pay_type, ["message"]) || "",
      right_status: 1,
      vn: ophh_data.regNo,
      cid: patient.cid
    }
  } catch (error) {
    ctx.throw(error)
  }
}

exports.getDuplicateHN = items => {
  return _.filter(
    _.uniq(
      _.map(items, function(item) {
        if (_.filter(items, { hn: item.hn }).length > 1) {
          return item.hn
        }
        return false
      })
    ),
    function(value) {
      return value
    }
  )
}

/**
 * @param {Object} patient ข้อมูลผู้ป่วย
 * @param {Object} right ข้อมูลสิทธิการรักษา
 * @param {Class} kioskService service data
 */
exports.getPayType = async (patient, right, kioskService, ctx) => {
  try {
    // สิทธิชำระเงินเอง
    const selfPayment = {
      payType: "10",
      message: "ชำระเงินเอง",
      right_status: 1
    }

    // ผู้ป่วยที่ไม่มีข้อมูลสิทธิ
    if (!get(right, ["maininscl"])) {
      return selfPayment
    }

    let pay_type = null

    if (get(patient, ["pay_type"]) === "10") {
      pay_type = selfPayment
    } else {
      pay_type = await this.genPayType(
        {
          hn: patient.hn,
          dept: patient.dept,
          appoint_status: patient.appoint_status
        },
        right,
        kioskService,
        ctx
      )
    }
    return pay_type
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @param {Object} patient ข้อมูลผู้ป่วย
 * @param {Object} right ข้อมูลสิทธิการรักษา
 * @param {Class} kioskService service data
 */
exports.genPayType = async (params, right, kioskService, ctx) => {
  try {
    // สิทธิชำระเงินเอง
    const selfPayment = {
      payType: "10",
      message: "ชำระเงินเอง",
      right_status: 1
    }
    let pay_type = selfPayment

    const last_right_data = await kioskService.getLastConEmp(sprintf(`% 7s`, params.hn))
    const payType = get(last_right_data, ["payType"]) || ""
    /* 96, 97, 98, 99, P1 */
    const payTypeList = [
      {
        code: "96",
        payType: "NO",
        message: "พบเจ้าหน้าที่ประกันสุขภาพช่อง 3",
        right_status: 3
      },
      {
        code: "97",
        payType: "N1",
        message: "พบเจ้าหน้าที่เพื่อตรวจสอบวงเงินใช้​สิทธิพรบ. รถ",
        right_status: 3
      },
      {
        code: "98",
        payType: "N1",
        message: "N1 พบเจ้าหน้าที่ห้องบัตร",
        right_status: 3
      },
      {
        code: "P1",
        payType: "NO",
        message: "พบเจ้าหน้าที่ประกันสุขภาพช่อง 3",
        right_status: 3
      },
      {
        code: "STP",
        payType: "99",
        message: "พบเจ้าหน้าที่ห้องบัตร",
        right_status: 3
      }
    ]

    if (["96", "97", "98", "P1"].includes(payType)) {
      pay_type = payTypeList.find(r => r.code === payType)
      if (isEmpty(pay_type)) {
        return {
          payType: "N1",
          message: "N1 พบเจ้าหน้าที่ห้องบัตร",
          right_status: 3
        }
      }
      return pay_type
    }

    if (get(right, ["maininscl"]) === "STP") {
      return payTypeList.find(r => r.code === "STP")
    }

    /* "UCS", "WEL", "SSS" */
    if (["UCS", "WEL", "SSS"].includes(right.maininscl)) {
      // ต้นสิทธิ รพ.อุดร
      if (get(right, ["hmain"]) === "10671") {
        if (isEmpty(get(right, ["hmain_op"])) || get(right, ["hmain_op"]) === "10671") {
          pay_type = await kioskService.getNhosToHomc(right)
          return utils.mappingPaytype(pay_type, selfPayment)
        }
      }

      // ต้นสิทธิไม่ใช้ รพ.อุดร
      // ตรวจสอบการมาแผนกที่รับบริการได้ทันที ANC(031)
      if (params.dept === "031") {
        pay_type = await kioskService.getNhosToHomc(right)
        return utils.mappingPaytype(pay_type, selfPayment)
      }

      // แผนก วัณโรค,จิตเวช รพ.เทศบาลใช้ได้เลย
      const isDept = ["017", "090", "091", "092"].includes(params.dept)
      if (isDept && (right.hmain === "12418" || right.hmain_op === "12418")) {
        pay_type = await kioskService.getNhosToHomc(right)
        return utils.mappingPaytype(pay_type, selfPayment)
      }

      // ผู้พิการถ้าต้นสิทธิอยู่ใน อุดร ใช้บริการได้เลย ถ้าไม่ใช่ให้เปลี่ยน visit type เป็น 005 ฉุกเฉิน
      if (get(right, ["maininscl"]) === "WEL" && get(right, ["subinscl"]) === "74") {
        if (get(right, ["purchaseprovince"]) === "4100") {
          pay_type = await kioskService.getNhosToHomc(right)
          return utils.mappingPaytype(pay_type, selfPayment)
        } else {
          pay_type = await kioskService.getNhosToHomc(right)
          return utils.mappingPaytype(pay_type, selfPayment)
        }
      }

      // พระภิษุต้นสิทธิ รพ.ในจังหวัดอุดร รับบริการได้เลย นอกนั้นดูใบส่งตัว
      if (get(right, ["maininscl"]) === "WEL" && get(right, ["subinscl"]) === "76") {
        if (get(right, ["purchaseprovince"]) === "4100") {
          pay_type = await kioskService.getNhosToHomc(right)
          return utils.mappingPaytype(pay_type, selfPayment)
        }
      }
      // return pay_type
    } else {
      // maininscl อื่นๆเช่น LGO,OFC ข้าราชกาล และอื่นๆ
      pay_type = await kioskService.getNhosToHomc(right)
      return utils.mappingPaytype(pay_type, selfPayment)
    }
    const refer_pass_data = await this.checkRefer(params.hn, right, kioskService, ctx)
    if (refer_pass_data) {
      if (get(refer_pass_data, ["action"]) === "HMAIN_CHANGE") {
        pay_type = {
          payType: "10",
          message:
            "โรงพยาบาลต้นสิทธิเปลี่ยนแปลง ข้อมูล สปสช.: " +
            get(refer_pass_data, ["nhso_hmain"]) +
            " ข้อมูล homc:" +
            get(refer_pass_data, ["homc_hmain"]),
          right_status: 0
        }
      } else {
        const referDateUnix = parseFloat(moment(refer_pass_data).format("X"))
        const currentDateUnix = parseFloat(moment(utils.getCurrentDate()).format("X"))
        if (referDateUnix >= currentDateUnix) {
          pay_type = await kioskService.getNhosToHomc(right)
          if (pay_type && get(pay_type, ["usrdrg"]) === "41") {
            return utils.updateObject(pay_type, {
              payType: "43",
              message: "UC พ.นัด จ่าย ธ. 30 บาท",
              right_status: 3
            })
          }
          if (pay_type) {
            return {
              payType: pay_type.usrdrg,
              message: pay_type.pay_typedes,
              right_status: 3
            }
          }
          return selfPayment
        } else {
          if (String(get(params, ["appoint_status"])) === "1") {
            pay_type = {
              payType: "10",
              message: "ใบส่งตัวหมดอายุ กรุณาติดต่อห้องบัตร",
              right_status: 0
            }
          } else {
            return selfPayment
          }
        }
      }
    }
  } catch (error) {
    ctx.throw(error)
  }
}

exports.checkRefer = async (hn, right, kioskService, ctx) => {
  try {
    let endDate = null // format YYYY-MM-DD
    const refer_data = await kioskService.getRefer(sprintf(`% 7s`, hn))

    if (isEmpty(refer_data)) return endDate

    if (isEmpty(get(right, ["hmain"]))) return endDate

    if (right.hmain !== refer_data.ReferHCODE) {
      return {
        action: "HMAIN_CHANGE",
        nhso_hmain: right.hmain,
        homc_hmain: refer_data.ReferHCODE
      }
    }

    if (!isEmpty(get(refer_data, ["ReferOutEndDate"]))) {
      const OutEndDate = String(get(refer_data, ["ReferOutEndDate"])).replace(/\s+/g, "")
      endDate = `${parseInt(OutEndDate.substr(0, 4)) - 543}-${OutEndDate.substr(4, 2)}-${OutEndDate.substr(6, 2)}`
    } else {
      // กรณีเจ้าหน้าที่ไม่ลง refer end date ให้นับจากวัน refer start date
      if (!isEmpty(get(refer_data, ["ReferStateDate"]))) {
        let StateDate = String(get(refer_data, ["ReferOutEndDate"])).replace(/\s+/g, "")
        StateDate = `${parseInt(OutEndDate.substr(0, 4)) - 543}-${OutEndDate.substr(4, 2)}-${OutEndDate.substr(6, 2)}`

        // รพช ในจังหวัดอุดร +6 เดือน
        if (get(right, ["purchaseprovince"]) === "4100") {
          endDate = moment(StateDate)
            .add("6", "months")
            .format("YYYY-MM-DD")
        } else if (["39", "42", "43", "47", "48", "97"].includes(get(right, ["purchaseprovince"]))) {
          // จังหวัดในเขต 8 +3 เดือน
          endDate = moment(StateDate)
            .add("3", "months")
            .format("YYYY-MM-DD")
        }
      }
    }
    return endDate
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} cid เลขบัตร ปชช
 */
exports.getPtRight = async (ctx, next) => {
  const db_queue = ctx.db_queue
  try {
    ctx.assert(ctx.params.cid, 400, "invalid params.")
    const kioskService = new KioskService({ db_queue: db_queue })

    const dataToken = await kioskService.findNhsoToken()
    ctx.assert(dataToken, 404, "ไม่พบข้อมูลโทเค็น กรุณาต้ังค่าโทเค็น.")

    const args = {
      user_person_id: String(dataToken.token_cid).replace(/ /g, ""),
      smctoken: dataToken.token_key,
      person_id: String(ctx.params.cid).replace(/ /g, "")
    }
    const soapClient = await ctx.soapClient
    const right = await new Promise((resolve, reject) => {
      soapClient.searchCurrentByPID(args, function(err, result) {
        if (err) {
          reject(err)
        } else {
          resolve(result.return)
        }
      })
    })
    // let right = await soapClient.searchCurrentByPIDAsync(args)
    ctx.assert(right, 404, "ไม่พบข้อมูลสิทธิการรักษา.")

    if (right.ws_status === "NHSO-00003") {
      ctx.throw(404, get(right, ["ws_status_desc"], "Token expire."))
    } else if (isEmpty(right.maininscl) || isEmpty(right.maininscl_name)) {
      ctx.throw(404, "ไม่พบข้อมูลสิทธิการรักษา")
    }
    ctx.assert(right.fname, 404, "Not found in NHSO.")
    ctx.body = right
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} q เลขบัตร ปชช หรือ เลข HN
 */
exports.searchPatientHandler = async (ctx, next) => {
  try {
    const q = ctx.params.q
    ctx.assert(q, 400, "invalid params.")

    const mssql = ctx.mssql
    const kioskService = new KioskService({ mssql: mssql })
    const patient = await kioskService.searchPatient(q)

    ctx.assert(patient, 404, "ไม่พบข้อมูลผู้ป่วย.")
    ctx.body = utils.trimValue(patient)
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 */
exports.getDepartments = async (ctx, next) => {
  const floorService = new FloorService({ db_queue: ctx.db_queue })
  const kioskService = new KioskService({ db_queue: ctx.db_queue })
  try {
    const id = ctx.query.id // kiosk id
    let floors = await floorService.findAll(true) // is active
    let services = []
    let service_groups = []
    let floor_ids = []
    let service_ids = []
    let group_ids = []

    if (id) {
      const kiosk = await kioskService.findModelKiosk(id)
      ctx.assert(kiosk, 404, "Data not found.")
      service_ids = unserialize(kiosk.service_ids) || []
      service_ids = service_ids.map(s => parseInt(s))
      service_ids = _.sortBy(service_ids)

      services = await kioskService.findServices(service_ids)

      floor_ids = services.map(service => service.floor_id)
      floor_ids = _.uniqBy(floor_ids, value => {
        return value
      })
      floor_ids = _.sortBy(floor_ids)

      group_ids = services.map(service => service.service_group_id)
      group_ids = _.uniqBy(group_ids, value => {
        return value
      })
      group_ids = _.sortBy(group_ids)

      service_groups = await kioskService.findServiceGroups(group_ids)
      floors = await floorService.findByIds(floor_ids)
    } else {
      services = await kioskService.findServices()
      service_ids = _.sortBy(services.map(service => service.service_id))

      floor_ids = services.map(service => service.floor_id)
      floor_ids = _.uniqBy(floor_ids, value => {
        return value
      })
      floor_ids = _.sortBy(floor_ids)

      group_ids = services.map(service => service.service_group_id)
      group_ids = _.uniqBy(group_ids, value => {
        return value
      })
      group_ids = _.sortBy(group_ids)

      service_groups = await kioskService.findServiceGroups(group_ids)
    }
    ctx.body = {
      floors: floors,
      floor_ids: floor_ids,
      service_groups: service_groups,
      group_ids: group_ids,
      services: services,
      service_ids: service_ids
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 */
exports.getKoioskOptions = async (ctx, next) => {
  try {
    // วันปัจุบัน 1-7
    const schedule_day = moment(utils.getCurrentDate()).format("E")

    const kioskService = new KioskService({ db_queue: ctx.db_queue })
    // ประเภทคิว
    let queue_types = await kioskService.findAllQueueTypes()
    queue_types = queue_types.map(row => {
      return utils.updateObject(row, {
        icon_path: row.icon_path ? `${row.icon_base_url}${row.icon_path.replace(/\\/g, "/")}` : ""
      })
    })
    // วิธีการมา
    let coming_types = await kioskService.findAllComingTypes()
    coming_types = coming_types.map(row => {
      return utils.updateObject(row, {
        icon_path: row.icon_path ? `${row.icon_base_url}${row.icon_path.replace(/\\/g, "/")}` : ""
      })
    })
    // schedules
    const schedules = await kioskService.findAllScheduleSetting(schedule_day)
    // ไอดีแผนก
    const service_ids = schedules.map(row => row.service_id)
    // แผนก
    const services = await kioskService.findServices(service_ids)
    // update settings
    const groups = await kioskService.findServiceGroups()

    const update_services = await kioskService.findServices()

    const queue_status = await kioskService.findAllQueueStatus()

    const update_options = {
      groups: groups,
      services: update_services,
      queue_types: queue_types,
      coming_types: coming_types,
      queue_status: queue_status
    }

    ctx.body = {
      queue_types: queue_types,
      coming_types: coming_types,
      services: services,
      schedules: schedules,
      isPlayAudio: true,
      current_date: moment(utils.getCurrentDate()).format("YYYY-MM-DD"),
      client_ip: ctx.request.ip,
      update_options: update_options
    }
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 * @param {string} id
 */
exports.getKioskById = async (ctx, next) => {
  try {
    const id = ctx.params.id
    ctx.assert(id, 400, "invalid params.")
    const kioskService = new KioskService({ db_queue: ctx.db_queue })
    const kiosk = await kioskService.findOneKiosk(id)
    let service_ids = unserialize(kiosk.service_ids) || []
    service_ids = service_ids.map(s => parseInt(s))
    service_ids = _.sortBy(service_ids)
    ctx.body = utils.updateObject(kiosk, {
      service_ids: service_ids
    })
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 */
exports.getKioskList = async (ctx, next) => {
  try {
    const kioskService = new KioskService({ db_queue: ctx.db_queue })
    let kiosk_list = await kioskService.findAllKiosk()
    kiosk_list = kiosk_list.map(row => {
      let service_ids = unserialize(row.service_ids) || []
      service_ids = service_ids.map(s => parseInt(s))
      service_ids = _.sortBy(service_ids)
      return utils.updateObject(row, {
        service_ids: service_ids
      })
    })
    ctx.body = kiosk_list
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 */
exports.getLEDDisplaySettings = async (ctx, next) => {
  try {
    const kioskService = new KioskService({ db_queue: ctx.db_queue })
    let led_displays = await kioskService.findAllLedDisplay()

    led_displays = led_displays.map(row => {
      let counter_service_ids = unserialize(row.counter_service_ids) || []
      counter_service_ids = counter_service_ids.map(s => parseInt(s))
      counter_service_ids = _.sortBy(counter_service_ids)

      let service_ids = unserialize(row.service_ids) || []
      service_ids = service_ids.map(s => parseInt(s))
      service_ids = _.sortBy(service_ids)
      return utils.updateObject(row, {
        counter_service_ids: counter_service_ids,
        service_ids: service_ids
      })
    })

    ctx.body = led_displays
  } catch (error) {
    ctx.throw(error)
  }
}

/**
 * @method GET
 */
exports.getDepartmentMedicine = async (ctx, next) => {
  try {
    const kioskService = new KioskService({ db_queue: ctx.db_queue })
    const floors = await kioskService.findAllFloors([1, 2])
    const floor_ids = floors.map(row => row.floor_id)
    const services = await kioskService.findServicesByFloorIds()
    const service_ids = services.map(row => row.service_id)
    let group_ids = services.map(row => row.service_group_id)
    group_ids = _.uniqBy(group_ids, value => {
      return value
    })
    const service_groups = await kioskService.findServiceGroups(group_ids)

    ctx.body = {
      floors: floors,
      floor_ids: floor_ids,
      service_groups: service_groups,
      group_ids: group_ids,
      services: services,
      service_ids: _.sortBy(service_ids)
    }
  } catch (error) {
    ctx.throw(error)
  }
}
