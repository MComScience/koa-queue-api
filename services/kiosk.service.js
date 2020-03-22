"use strict"

const utils = require("../utils")
const isEmpty = require("is-empty")
const get = require("lodash/get")

const moment = require("moment")
moment.locale("th")

class kioskService {
  constructor(opts) {
    // ฐานข้อมูล รพ
    if (opts.mssql) {
      this.mssql = opts.mssql
    }
    // ฐานข้อมูลระบบคิว
    if (opts.db_queue) {
      this.db_queue = opts.db_queue
    }
    // ฐานข้อมูล backend kiosk
    if (opts.db_api_udh) {
      this.db_api_udh = opts.db_api_udh
    }
  }

  /**
   * ข้อมูลผู้ป่วย
   * @param {string} q เลข HN ผู้ป่วย
   */
  async findPatientByHN(q) {
    try {
      const profiles = this.mssql.raw(
        `SELECT
          REPLACE(apd.hn, ' ', '') as hn,
          REPLACE(CardID, ' ', '') AS cid,
          passportID AS passid,
          REPLACE(titleCode, ' ', '') AS title,
          REPLACE(firstName, ' ', '') AS firstname,
          REPLACE(lastName, ' ', '') AS lastname,
          CONCAT ( RTRIM( titleCode ), ' ', RTRIM( firstName ), ' ', RTRIM( lastName ) ) AS fullname,
          CONVERT ( DATE, bday ) AS birth_date,
          age,
          bloodGroup AS blood_group,
          NATDES AS nation,
          CONCAT (
            RTRIM( addr1 ),
            ' ',
            RTRIM( addr2 ),
            ' ',
            RTRIM( soi ),
            ' ',
            RTRIM( road ),
            ' ',
            RTRIM( moo ),
            ' ',
            'ต.',
            RTRIM( tambonName ),
            ' ',
            'อ.',
            RTRIM( regionName ),
            ' ',
            'จ.',
            RTRIM( areaName ),
            ' ',
            postalCode 
          ) AS fulladdress,
          occdes AS occ,
        CASE
            
            WHEN nation_code = '99' THEN
            '1' ELSE '0' 
          END AS nation_status 
        FROM
          v_patient_detail AS apd 
        WHERE
          1 = 1 
          AND hn = ?`,
        [q]
      )
      return Promise.resolve(profiles)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * ข้อมูลผู้ป่วย
   * @param {string} cid เลขบัตร ปชช. ผู้ป่วย
   */
  async findPatientByCardId(cid) {
    try {
      const profiles = this.mssql.raw(
        `SELECT
          REPLACE(apd.hn, ' ', '') as hn,
          REPLACE(CardID, ' ', '') AS cid,
          passportID AS passid,
          REPLACE(titleCode, ' ', '') AS title,
          REPLACE(firstName, ' ', '') AS firstname,
          REPLACE(lastName, ' ', '') AS lastname,
          CONCAT ( RTRIM( titleCode ), ' ', RTRIM( firstName ), ' ', RTRIM( lastName ) ) AS fullname,
          CONVERT ( DATE, bday ) AS birth_date,
          age,
          bloodGroup AS blood_group,
          NATDES AS nation,
          CONCAT (
            RTRIM( addr1 ),
            ' ',
            RTRIM( addr2 ),
            ' ',
            RTRIM( soi ),
            ' ',
            RTRIM( road ),
            ' ',
            RTRIM( moo ),
            ' ',
            'ต.',
            RTRIM( tambonName ),
            ' ',
            'อ.',
            RTRIM( regionName ),
            ' ',
            'จ.',
            RTRIM( areaName ),
            ' ',
            postalCode 
          ) AS fulladdress,
          occdes AS occ,
        CASE
            
            WHEN nation_code = '99' THEN
            '1' ELSE '0' 
          END AS nation_status 
        FROM
          v_patient_detail AS apd 
        WHERE
          1 = 1 
          AND CardID = ?`,
        [cid]
      )
      return Promise.resolve(profiles)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn เลข HN ผู้ป่วย
   */
  async getMaxOPD(hn) {
    try {
      const result = await this.mssql
        .select("*")
        .from("OPD_H")
        .where({ hn: hn })
        .whereRaw(`registDate=(SELECT MAX(registDate) FROM OPD_H WHERE hn = ?)`, [hn])
        .first()
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * รายการนัดผู้ป่วย
   * @param {string} hn เลข HN ผู้ป่วย
   * @param {string} date วันที่นัด
   */
  async getAppoint(hn, date = null) {
    try {
      if (date) {
        const appoints = this.mssql.raw(
          `SELECT
            hn,
            CONVERT (
              DATE,
              SUBSTRING ( CONVERT ( CHAR, appoint_date - 5430000 ), 1, 4 ) + SUBSTRING ( CONVERT ( CHAR, appoint_date ), 5, 2 ) + SUBSTRING ( CONVERT ( CHAR, appoint_date ), 7, 2 ) 
            ) AS app_date,
            appoint_date,
            appoint_time_from AS app_time_from,
            appoint_time_to AS app_time_to,
            appoint_note AS app_note,
            dept.deptCode AS dept_code,
            dept.deptDesc AS dept_desc,
            doc.docCode AS doc_code,
            CONCAT ( RTRIM( doc.doctitle ), ' ', RTRIM( doc.docName ), ' ', RTRIM( doc.docLName ) ) AS doc_name 
          FROM
            Appoint app
            INNER JOIN DEPT dept ON ( dept.deptCode= app.pre_dept_code )
            LEFT JOIN DOCC doc ON ( doc.docCode= doctor ) 
          WHERE
            hn = ?
            AND appoint_date = ?`,
          [hn, date]
        )
        return Promise.resolve(appoints)
      } else {
        const appoints = this.mssql.raw(
          `SELECT
          hn,
          CONVERT (
            DATE,
            SUBSTRING ( CONVERT ( CHAR, appoint_date - 5430000 ), 1, 4 ) + SUBSTRING ( CONVERT ( CHAR, appoint_date ), 5, 2 ) + SUBSTRING ( CONVERT ( CHAR, appoint_date ), 7, 2 ) 
          ) AS app_date,
          appoint_date,
          appoint_time_from AS app_time_from,
          appoint_time_to AS app_time_to,
          appoint_note AS app_note,
          dept.deptCode AS dept_code,
          dept.deptDesc AS dept_desc,
          doc.docCode AS doc_code,
          CONCAT ( RTRIM( doc.doctitle ), ' ', RTRIM( doc.docName ), ' ', RTRIM( doc.docLName ) ) AS doc_name 
        FROM
          Appoint app
          INNER JOIN DEPT dept ON ( dept.deptCode= app.pre_dept_code )
          LEFT JOIN DOCC doc ON ( doc.docCode= doctor ) 
        WHERE
          hn = ?`,
          [hn]
        )
        return Promise.resolve(appoints)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn เลข HN
   * @param {string} regisDate วันที่ลงทะเบียน
   */
  async getLastDept(hn, regisDate) {
    try {
      const result = await this.mssql.raw(
        `SELECT
          dqd.deptCode AS dept_code,
          de.deptDesc AS dept_desc,
          doc.docCode AS doc_code,
          CONCAT ( RTRIM( doc.doctitle ), ' ', RTRIM( doc.docName ), ' ', RTRIM( doc.docLName ) ) AS doc_name,
          (
          SELECT
            pt.pay_typedes 
          FROM
            Bill_h
            INNER JOIN Paytype pt ON ( pt.pay_typecode= useDrg ) 
          WHERE
            hn = dqd.hn 
            AND regNo = dqd.regNo 
          ) AS pay_typedes,
          oh.regNo AS vn,
        CASE
            
            WHEN app.hn IS NULL THEN
            '0' ELSE '1' 
          END AS app_dept_status,
          app.appoint_time_from AS app_time_from,
          app.appoint_time_to AS app_time_to 
        FROM
          Deptq_d dqd
          INNER JOIN OPD_H oh ON ( oh.hn= dqd.hn AND oh.regNo= dqd.regNo )
          INNER JOIN DEPT de ON ( de.deptCode= dqd.deptCode )
          LEFT JOIN DOCC doc ON ( doc.docCode= dqd.docCode )
          LEFT JOIN Appoint app ON ( app.hn= oh.hn AND app.appoint_date= oh.registDate AND app.pre_dept_code= dqd.deptCode ) 
        WHERE
          oh.hn = ? 
          AND oh.registDate = ?`,
        [hn, regisDate]
      )
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn
   * @param {string} regisDate format YYYYMMDD (Thai year + 543) ex. 25630205
   */
  async getLastRightDate(hn, regisDate) {
    try {
      const result = await this.mssql
        .select("pt.pay_typedes")
        .from(this.mssql.raw("OPD_H oh"))
        .joinRaw("INNER JOIN Bill_h bh ON ( bh.hn= oh.hn AND oh.regNo= bh.regNo )")
        .joinRaw("INNER JOIN Paytype pt ON ( pt.pay_typecode= useDrg ) ")
        .whereRaw("oh.hn = ?", [hn])
        .whereRaw("oh.registDate = ?", [regisDate])
        .first()
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getPTProfile(q) {
    try {
      if (q.length < 13) {
        const result = await this.mssql
          .select("pt.*", "ptt.titleName")
          .from(this.mssql.raw("PATIENT pt"))
          .joinRaw("INNER JOIN PatSS pat ON(pat.hn=pt.hn)")
          .joinRaw("LEFT JOIN PTITLE ptt ON(ptt.titleCode=pt.titleCode)")
          .whereRaw("1 = 1", [])
          .whereRaw("pt.hn = ?", [q])
          .first()
        return Promise.resolve(result)
      } else {
        const result = await this.mssql
          .select("pt.*", "ptt.titleName")
          .from(this.mssql.raw("PATIENT pt"))
          .joinRaw("INNER JOIN PatSS pat ON(pat.hn=pt.hn)")
          .joinRaw("LEFT JOIN PTITLE ptt ON(ptt.titleCode=pt.titleCode)")
          .whereRaw("1 = 1", [])
          .whereRaw("pat.CardID = ?", [q])
          .first()
        return Promise.resolve(result)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn
   */
  async getLastConEmp(hn) {
    try {
      const result = await this.mssql
        .select("contcode", this.mssql.raw("useDrg AS payType"))
        .from("Con_emp")
        .where({
          hn: hn
        })
        .whereRaw("makedate=(SELECT MAX(makedate) FROM Con_emp WHERE hn = ?)", [hn])
        .first()
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getNhosToHomc(right) {
    try {
      const result = await this.db_api_udh
        .select("*")
        .from("r_nhsoconverthomc")
        .where({
          MAININSCL: right.maininscl,
          Subinscl: right.subinscl
        })
        .first()
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn
   */
  async getRefer(hn) {
    try {
      const result = await this.mssql
        .select("*")
        .from("Refer")
        .where({ Hn: hn })
        .orderBy("ReferOutEndDate", "desc")
        .first()
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {Object} patient
   */
  async insertOPD_H(patient) {
    const mssql = this.mssql
    try {
      const currentDate = utils.getCurrentDate()
      const year = parseInt(utils.getCurrentDateFormat("YYYY")) + 543 // ปี พ.ศ.
      const regisDate = `${year}${moment(currentDate).format("MMDD")}` // ex. 25630215 format YYYYMMDD
      const regisTime = moment(currentDate).format("HHmm")
      const regisTime2 = moment(currentDate).format("HH:mm")
      const userMaker = "ทดสอบ"

      patient = utils.updateObject(patient, {
        hn: utils.sprintf(`% 7s`, patient.hn)
      })

      const ophh_data = await this.getOPD_H(patient.hn, regisDate)
      if (isEmpty(ophh_data)) {
        const data_regNo = await this.getMaxOPD_H(patient.hn)
        const regNo = utils.genRegNo(data_regNo.regNo)
        const GETDATE = await mssql.raw("SELECT GETDATE() AS DateTime")
        const VisitNo = await mssql.raw("SELECT lastOPDLine+1 AS VisitNo FROM Company")
        const opdData = {
          regNo: regNo,
          ipdStatus: "0",
          dept: patient.dept,
          outStatus: "0",
          registDate: regisDate,
          stat_flag: "0",
          doctorName: patient.doctor,
          codeName: patient.codeName,
          hn: patient.hn,
          timePt: regisTime,
          areaCode: patient.areaCode,
          codeLName: patient.codeLName,
          oldPat: "Y",
          lastUpd: GETDATE[0].DateTime,
          walkin: "N",
          maker: userMaker,
          visitcat_code: patient.visit_type,
          notify_hmain: "N",
          VisitNo: VisitNo[0].VisitNo,
          CardOutTime: regisTime2,
          CardOutMaker: userMaker,
          CardOutDate: GETDATE[0].DateTime
        }
        const inserted = await mssql("OPD_H")
          .returning("*")
          .insert(opdData)
        const ophh_data = await this.getOPD_H(patient.hn, regisDate)
        return Promise.resolve(ophh_data)
      } else {
        if (get(ophh_data, ["outStatus"]) === "I") {
          await this.updateOPD_H(patient.hn, regNo)
          await this.updatePATIENT(patient.hn, "O")
        }
        const depts = String(get(ophh_data, ["dept"]))
          .replace(/\s+/g, "")
          .split(";")
        if (Array.isArray(depts)) {
          if (!depts.includes(patient.dept)) {
            const newDept = `${ophh_data.dept};${patient.dept}`
            await this.updateDeptOPD_H(ophh_data.hn, ophh_data.regNo, newDept)
          }
        } else if (patient.dept !== depts) {
          const newDept = `${ophh_data.dept};${patient.dept}`
          await this.updateDeptOPD_H(ophh_data.hn, ophh_data.regNo, newDept)
        }
        return Promise.resolve(ophh_data)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn
   * @param {Datetime} regisDate
   */
  async getOPD_H(hn, regisDate) {
    const mssql = this.mssql
    try {
      if (regisDate) {
        const result = await mssql
          .select("*")
          .from("OPD_H")
          .where({ hn: hn, registDate: regisDate })
          .first()
        return Promise.resolve(result)
      } else {
        const result = await mssql
          .select("*")
          .from("OPD_H")
          .where({ hn: hn })
          .first()
        return Promise.resolve(result)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn
   */
  async getMaxOPD_H(hn) {
    const mssql = this.mssql
    try {
      const result = await mssql
        .select("*")
        .from("OPD_H")
        .where({ hn: hn })
        .whereRaw("registDate = (SELECT MAX(registDate) FROM OPD_H WHERE hn = ?)", [hn])
        .orderBy("timePt", "desc")
        .first()
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn
   * @param {string} regNo
   * @param {string} outStatus
   */
  async updateOPD_H(hn, regNo, outStatus = "O") {
    const mssql = this.mssql
    try {
      const updated = await mssql("OPD_H")
        .where({
          hn: hn,
          regNo: regNo
        })
        .update(
          {
            outStatus: outStatus
          },
          ["*"]
        )
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn
   * @param {string} outStatus
   */
  async updatePATIENT(hn, outStatus = "O") {
    const mssql = this.mssql
    try {
      const updated = await mssql("PATIENT")
        .where({
          hn: hn
        })
        .update(
          {
            outStatus: outStatus
          },
          ["*"]
        )
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn
   * @param {string} regNo
   * @param {string} dept
   */
  async updateDeptOPD_H(hn, regNo, dept) {
    const mssql = this.mssql
    try {
      const updated = await mssql("OPD_H")
        .where({
          hn: hn,
          regNo: regNo
        })
        .update(
          {
            dept: dept
          },
          ["*"]
        )
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {Object} patient
   * @param {Object} ophh_data
   * @param {string} hos_main_code
   */
  async insertDeptq_d(patient, ophh_data, hos_main_code) {
    const mssql = this.mssql
    try {
      const currentDate = utils.getCurrentDate()
      const year = parseInt(utils.getCurrentDateFormat("YYYY")) + 543 // ปี พ.ศ.
      const regisDate = `${year}${moment(currentDate).format("MMDD")}` // ex. 25630215 format YYYYMMDD
      const regisTime = moment(currentDate).format("HH:mm") // 12:00
      const userMaker = "ทดสอบ"

      const deptq_d_data = await this.getDeptq_d(patient.hn, patient.dept, ophh_data.regNo)
      if (isEmpty(deptq_d_data)) {
        const Company = await mssql("Company").update(
          {
            curRx: mssql.raw("RIGHT('000'+CAST(curRx+1 AS VARCHAR(4)),4)")
          },
          ["*"]
        )
        const dept = await mssql
          .select("*")
          .from("DEPT")
          .where({ deptCode: patient.dept })
          .first()
        // const maxDeptq_d = await mssql.select("")
        const inserted = await mssql("Deptq_d")
          .returning("*")
          .insert({
            toQId: dept.qID,
            qStatus: "0",
            fromQId: "zzzzzz",
            hn: get(patient, ["hn"]),
            regNo: ophh_data.regNo,
            deptCode: get(patient, ["dept"]),
            docCode: get(patient, ["doctor"]),
            qDateIn: regisDate,
            qTimeIn: regisTime,
            cardType: " ",
            cardNo: 0,
            contCode: hos_main_code,
            newPat: "N",
            visitType: "C",
            lastDetailNo: 0,
            toQNo: mssql.raw(
              `(
              SELECT
                ISNULL( MAX ( CAST ( toQNo AS INT ) ) + 1, 1 ) 
              FROM
                Deptq_d 
              WHERE
                qDateIn = ?
                AND deptCode = ? 
              )`,
              [regisDate, patient.dept]
            ),
            fromQNo: "00000000",
            rxNo: mssql.raw(`(
              SELECT
                CONCAT ( SUBSTRING ( lastRxDate, 3, 6 ), RIGHT ( '000' + CAST ( curRx AS VARCHAR ( 4 ) ), 4 ) ) 
              FROM
                Company 
              )`),
            maker: userMaker,
            registerType: "N"
          })
        return Promise.resolve(inserted)
      } else {
        return Promise.resolve(deptq_d_data)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn
   * @param {string} dept
   * @param {string} regNo
   */
  async getDeptq_d(hn, dept, regNo) {
    const mssql = this.mssql
    try {
      const result = await mssql
        .select("*")
        .from("Deptq_d")
        .where({
          hn: hn,
          deptCode: dept,
          regNo: regNo
        })
        .first()
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {Object} patient
   * @param {Object} ophh_data
   * @param {string} hos_main_code
   * @param {string} pay_type
   */
  async insertVisitRight(patient, ophh_data, hos_main_code, pay_type = "10") {
    const mssql = this.mssql
    try {
      const visit_right_data = await this.getVisitRight(patient.hn, ophh_data)
      let inserted = visit_right_data
      if (isEmpty(visit_right_data)) {
        const GETDATE = await mssql.raw("SELECT GETDATE() AS DateTime")
        const currentDate = utils.getCurrentDate()
        const regisTime = moment(currentDate).format("HHmm") // 1200
        inserted = await mssql("VisitRight")
          .returning("*")
          .insert({
            hn: get(patient, ["hn"]),
            regNo: ophh_data.regNo,
            runNo: 1,
            contCode: hos_main_code,
            payType: pay_type,
            limitAmount: 0,
            cancelled: "N",
            maker: "ทดสอบ",
            makeDate: GETDATE[0].DateTime,
            makeTime: regisTime
          })
        return Promise.resolve(inserted)
      }
      return Promise.resolve(inserted)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn
   * @param {Object} opdh_data
   */
  async getVisitRight(hn, opdh_data) {
    const mssql = this.mssql
    try {
      if (opdh_data) {
        const result = await mssql
          .select("*")
          .from("VisitRight")
          .where({ hn: hn, regNo: opdh_data.regNo })
          .first()
        return Promise.resolve(result)
      } else {
        const result = await mssql
          .select("*")
          .from("VisitRight")
          .where({ hn: hn })
          .whereRaw("makeDate = (SELECT MAX(makeDate) FROM VisitRight WHERE hn = ?)", [hn])
          .first()
        return Promise.resolve(result)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {Object} patient
   * @param {string} hmain
   * @param {string} hsub
   * @param {string} pay_type
   */
  async insertCon_emp(patient, hmain, hsub, pay_type = "10") {
    const mssql = this.mssql
    try {
      const con_emp = await this.getCon_emp(patient.hn, pay_type)
      let inserted = con_emp
      if (isEmpty(con_emp)) {
        const contcode = utils.substrPayType(hmain, pay_type)
        const currentDate = utils.getCurrentDate()
        const year = parseInt(utils.getCurrentDateFormat("YYYY")) + 543 // ปี พ.ศ.
        const regisDate = `${year}${moment(currentDate).format("MMDD")}` // ex. 25630215 format YYYYMMDD
        const userMaker = "ทดสอบ"

        const GETDATE = await mssql.raw("SELECT GETDATE() AS DateTime")

        inserted = await mssql("Con_emp")
          .returning("*")
          .insert({
            right_date: regisDate,
            titleCode: get(patient, ["titleCode"], null),
            firstName: get(patient, ["firstName"], null),
            lastName: get(patient, ["lastName"], null),
            BirthDate: get(patient, ["birthDay"], null),
            contcode: contcode,
            codeName: get(patient, ["codeName"], null),
            codeLName: get(patient, ["codeLName"], null),
            useDrg: pay_type,
            HMAIN: hmain,
            HSUB: hsub,
            userCode: userMaker,
            CardID: get(patient, ["cid"], null),
            makedate: GETDATE[0].DateTime
          })
      }
      return Promise.resolve(inserted)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn
   * @param {string} pay_type
   */
  async getCon_emp(hn, pay_type) {
    const mssql = this.mssql
    try {
      const result = await mssql
        .select("*")
        .from("Con_emp")
        .where({ hn: hn, useDrg: pay_type })
        .first()
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {Object} patient
   * @param {string} regNo
   * @param {string} hmain
   * @param {string} hsub
   * @param {string} pay_type
   */
  async insertBill_h(patient, regNo, hmain, hsub, pay_type = "10") {
    const mssql = this.mssql
    try {
      let bill_h = await this.getBill_h(patient.hn, regNo)
      if (isEmpty(bill_h)) {
        const contcode = utils.substrPayType(hmain, pay_type)
        const currentDate = utils.getCurrentDate()
        const year = parseInt(utils.getCurrentDateFormat("YYYY")) + 543 // ปี พ.ศ.
        const regisDate = `${year}${moment(currentDate).format("MMDD")}` // ex. 25630215 format YYYYMMDD
        const regisTime = moment(currentDate).format("HHmm") // 1200
        const userMaker = "ทดสอบ"

        bill_h = await mssql("Bill_h")
          .returning("*")
          .insert({
            hn: get(patient, ["hn"], null),
            regNo: regNo,
            lastDetail: "000000",
            totalAmt: "0",
            totalAmtPaid: "0",
            contCode: contcode,
            firstChgRec: "000000",
            lastChgRec: "000000",
            useDrg: pay_type,
            REFERIN: "",
            HMAIN: hmain,
            HSUB: hsub,
            rigthDate: regisDate,
            visit_insystem: "Y",
            lastEditRight: userMaker,
            rigthTime: regisTime,
            regist_date: regisDate
          })
      }
      return Promise.resolve(bill_h)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   *
   * @param {string} hn
   * @param {string} regNo
   */
  async getBill_h(hn, regNo) {
    const mssql = this.mssql
    try {
      const result = await mssql
        .select("*")
        .from("Bill_h")
        .where({ hn: hn, regNo: regNo })
        .first()
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async checkDupRxNo(patient, ophh_data) {
    const mssql = this.mssql
    try {
      const rx = await mssql
        .select("*")
        .from("Deptq_d")
        .where({
          hn: get(patient, ["hn"]),
          regNo: get(ophh_data, ["regNo"]),
          deptCode: get(patient, ["dept"])
        })
        .first()
      const depts = await mssql
        .select("*")
        .from("Deptq_d")
        .where({ rxNo: rx.rxNo })
      let updated = depts
      if (depts && depts.length > 1) {
        const Company = await mssql("Company").update(
          {
            curRx: mssql.raw("RIGHT('000'+CAST(curRx+1 AS VARCHAR(4)),4)")
          },
          ["*"]
        )
        updated = await mssql("Deptq_d")
          .where({
            rxNo: rx.rxNo,
            hn: get(patient, ["hn"]),
            regNo: get(ophh_data, ["regNo"]),
            deptCode: get(patient, ["dept"])
          })
          .update(
            {
              rxNo: mssql.raw(
                "(SELECT CONCAT(SUBSTRING(lastRxDate,3,6),RIGHT('000'+CAST(curRx AS VARCHAR(4)),4)) FROM Company)"
              )
            },
            ["*"]
          )
      }
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findNhsoToken() {
    const db_queue = this.db_queue
    try {
      const token = await db_queue
        .select()
        .from("tbl_nhso_token")
        .orderBy("created_at", "desc")
        .first()
      return Promise.resolve(token)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async searchPatient(q) {
    const mssql = this.mssql
    try {
      if (q.length < 13) {
        const patient = await mssql
          .select("*")
          .from("Q_No")
          .where({ hn: utils.sprintf(`% 7s`, q) })
          .first()
        return Promise.resolve(patient)
      } else {
        const patient = await mssql
          .select("*")
          .from("Q_No")
          .where({ CardID: q })
          .first()
        return Promise.resolve(patient)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelKiosk(id) {
    const db_queue = this.db_queue
    try {
      const kiosk = await db_queue
        .select("*")
        .from("tbl_kiosk")
        .where({ kiosk_id: id })
        .first()
      return Promise.resolve(kiosk)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findServices(serviceIds = []) {
    const db_queue = this.db_queue
    try {
      if (serviceIds.length) {
        const services = await db_queue
          .select("tbl_service.*", "tbl_service_group.service_group_name")
          .from("tbl_service")
          .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
          .innerJoin("tbl_floor", "tbl_floor.floor_id", "tbl_service.floor_id")
          .where({
            "tbl_service.service_status": 1,
            "tbl_service_group.service_group_status": 1,
            "tbl_service.kiosk_active": 1,
            "tbl_floor.floor_status": 1
          })
          .whereIn("tbl_service.service_id", serviceIds)
          .orderBy("tbl_service.service_order", "asc")
          .orderBy("tbl_service_group.service_group_order", "asc")
          .groupBy("tbl_service.service_id")
        return Promise.resolve(services)
      } else {
        const services = await db_queue
          .select("tbl_service.*", "tbl_service_group.service_group_name")
          .from("tbl_service")
          .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
          .innerJoin("tbl_floor", "tbl_floor.floor_id", "tbl_service.floor_id")
          .where({
            "tbl_service.service_status": 1,
            "tbl_service_group.service_group_status": 1,
            "tbl_service.kiosk_active": 1,
            "tbl_floor.floor_status": 1
          })
          .orderBy("tbl_service.service_order", "asc")
          .orderBy("tbl_service_group.service_group_order", "asc")
          .groupBy("tbl_service.service_id")
        return Promise.resolve(services)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findServiceGroups(groupIds = []) {
    const db_queue = this.db_queue
    try {
      if (groupIds.length) {
        const groups = await db_queue
          .select("*")
          .from("tbl_service_group")
          .where({
            service_group_status: 1
          })
          .whereIn("tbl_service_group.service_group_id", groupIds)
        return Promise.resolve(groups)
      } else {
        const groups = await db_queue
          .select("*")
          .from("tbl_service_group")
          .where({
            service_group_status: 1
          })
        return Promise.resolve(groups)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findAllQueueTypes() {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select("*")
        .from("tbl_queue_type")
        .where({ queue_type_status: 1 })
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findAllComingTypes() {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select("*")
        .from("tbl_coming_type")
        .where({ coming_type_status: 1 })
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findAllScheduleSetting(schedule_day) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select("*")
        .from("tbl_schedule_setting")
        .where({ schedule_active: 1, schedule_day: schedule_day })
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findAllQueueStatus() {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select("*")
        .from("tbl_queue_status")
        .whereNotIn("queue_status_id", [5])
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findOneKiosk(id) {
    const db_queue = this.db_queue
    try {
      const row = await db_queue
        .select("*")
        .from("tbl_kiosk")
        .where({ kiosk_id: id })
        .first()
      return Promise.resolve(row)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findAllKiosk() {
    const db_queue = this.db_queue
    try {
      const row = await db_queue
        .select("*")
        .from("tbl_kiosk")
        .where({ kiosk_status: 1 })
      return Promise.resolve(row)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findAllLedDisplay() {
    const db_queue = this.db_queue
    try {
      const row = await db_queue
        .select("*")
        .from("tbl_led_display")
        .where({ led_display_status: 1 })
      return Promise.resolve(row)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findAllFloors(ids = []) {
    const db_queue = this.db_queue
    try {
      if (ids.length) {
        const rows = await db_queue
          .select("*")
          .from("tbl_floor")
          .where({ floor_status: 1 })
          .whereIn("floor_id", ids)
        return Promise.resolve(rows)
      } else {
        const rows = await db_queue
          .select("*")
          .from("tbl_floor")
          .where({ floor_status: 1 })
        return Promise.resolve(rows)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findServicesByFloorIds() {
    const db_queue = this.db_queue
    try {
      const services = await db_queue
        .select("tbl_service.*", "tbl_service_group.service_group_name", "tbl_prefix.prefix_code")
        .from("tbl_service")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("tbl_floor", "tbl_floor.floor_id", "tbl_service.floor_id")
        .leftJoin("tbl_prefix", "tbl_prefix.prefix_id", "tbl_service.prefix_id")
        .where({
          "tbl_service.service_status": 1,
          "tbl_service_group.service_group_status": 1,
          "tbl_service.kiosk_active": 1,
          "tbl_floor.floor_status": 1
        })
        .whereIn("tbl_floor.floor_id", [1, 2])
        .orderBy("tbl_service.service_order", "asc")
        .orderBy("tbl_service_group.service_group_order", "asc")
        .groupBy("tbl_service.service_id")
      return Promise.resolve(services)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findQueueWaiting(params) {
    const db_queue = this.db_queue
    try {
      const rows = db_queue
        .select("tbl_queue_detail.*", "tbl_queue.queue_no")
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .where({
          "tbl_queue_detail.queue_status_id": 1,
          "tbl_queue_detail.service_id": params.service_id
        })
        .whereBetween("tbl_queue_detail.created_at", [params.startDate, params.endDate])
        .whereRaw("tbl_queue_detail.duration_time <>  ?", ["คิวเสริม"])
        .orderBy("tbl_queue_detail.created_at", "asc")
        .groupBy("tbl_queue_detail.queue_detail_id")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = kioskService
