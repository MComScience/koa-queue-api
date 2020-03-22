"use strict"

class AppointmentService {
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

  async getDeptGroups() {
    const mssql = this.mssql
    try {
      const rows = await mssql
        .select("DEPTGROUP.*", "DEPT.deptDesc")
        .from("DEPTGROUP")
        .innerJoin("DEPT", "DEPTGROUP.deptCode", "DEPT.deptCode")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getAppointDeptDoccWithDeptCode(deptCode) {
    const mssql = this.mssql
    try {
      const rows = await mssql
        .select("Appoint_dep_doc.*", "DEPT.deptDesc", "DOCC.docName", "DOCC.docLName", "DOCC.doctitle")
        .from("Appoint_dep_doc")
        .innerJoin("DEPT", "Appoint_dep_doc.deptCode", "DEPT.deptCode")
        .innerJoin("DOCC", "Appoint_dep_doc.docCode", "DOCC.docCode")
        .where({
          "Appoint_dep_doc.deptCode": deptCode
        })
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getAppointDataOfDoctor(condition) {
    const mssql = this.mssql
    try {
      const rows = await mssql
        .select(
          "Appoint.doctor",
          "Appoint.hn",
          "Appoint.appoint_date",
          "Appoint.appoint_time_from",
          "Appoint.appoint_time_to",
          "Appoint.appoint_note",
          "Appoint.pre_dept_code",
          "Appoint.maker",
          "Appoint.keyin_time",
          "Appoint.delete_flag",
          "Appoint.phone",
          "Appoint.CID",
          "DOCC.docName",
          "DOCC.docLName",
          "DOCC.doctitle",
          "PATIENT.firstName",
          "PATIENT.lastName",
          "PATIENT.titleCode",
          "DEPT.deptDesc"
        )
        .from("Appoint")
        .innerJoin("DOCC", "Appoint.doctor", "DOCC.docCode")
        .innerJoin("PATIENT", "Appoint.hn", "PATIENT.hn")
        .innerJoin("DEPT", "Appoint.pre_dept_code", "DEPT.deptCode")
        .where(condition)
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getPatient(condition) {
    const mssql = this.mssql
    try {
      const patient = await mssql
        .select("v_patient_detail.*")
        .from("v_patient_detail")
        .where(condition)
        .first()
      return Promise.resolve(patient)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getAppointDataOfPatient(condition) {
    const mssql = this.mssql
    try {
      const rows = await mssql
        .select(
          "Appoint.doctor",
          "Appoint.hn",
          "Appoint.appoint_date",
          "Appoint.appoint_time_from",
          "Appoint.appoint_time_to",
          "Appoint.appoint_note",
          "Appoint.pre_dept_code",
          "Appoint.maker",
          "Appoint.keyin_time",
          "Appoint.delete_flag",
          "Appoint.phone",
          "Appoint.CID",
          "DOCC.docName",
          "DOCC.docLName",
          "DOCC.doctitle",
          "PATIENT.firstName",
          "PATIENT.lastName",
          "PATIENT.titleCode",
          "DEPT.deptDesc"
        )
        .from("Appoint")
        .innerJoin("DOCC", "Appoint.doctor", "DOCC.docCode")
        .innerJoin("PATIENT", "Appoint.hn", "PATIENT.hn")
        .innerJoin("DEPT", "Appoint.pre_dept_code", "DEPT.deptCode")
        .where(condition)
        .orderBy("Appoint.appoint_date", "desc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDeptq_d(condition) {
    const mssql = this.mssql
    try {
      const row = await mssql
        .select("Deptq_d.*")
        .from("Deptq_d")
        .where(condition)
        .orderBy("Deptq_d.qDateIn", "desc")
        .first()
      return Promise.resolve(row)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findAllMedScheduleTime(condition) {
    const db_queue = this.db_queue
    try {
      const schedules = await db_queue
        .select(
          "tbl_med_schedule.doctor_id",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name",
          "tbl_med_schedule.schedule_date",
          "tbl_med_schedule_time.med_schedule_time_id",
          "tbl_med_schedule_time.med_schedule_id",
          db_queue.raw("DATE_FORMAT( tbl_med_schedule_time.start_time, '%H:%i' ) AS start_time"),
          db_queue.raw("DATE_FORMAT( tbl_med_schedule_time.end_time, '%H:%i' ) AS end_time"),
          "tbl_med_schedule_time.med_schedule_time_qty"
        )
        .from("tbl_med_schedule_time")
        .innerJoin("tbl_med_schedule", "tbl_med_schedule_time.med_schedule_id", "tbl_med_schedule.med_schedule_id")
        .innerJoin("tbl_doctor", "tbl_med_schedule.doctor_id", "tbl_doctor.doctor_id")
        .where(condition)
        .orderBy("tbl_med_schedule.doctor_id", "asc")
        .orderBy("tbl_med_schedule_time.start_time", "asc")
        .orderBy("tbl_med_schedule.schedule_date", "asc")
      return Promise.resolve(schedules)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findAllAppoint(condition) {
    const mssql = this.mssql
    try {
      const rows = await mssql
        .select("Appoint.*")
        .from("Appoint")
        .where(condition)
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async insertAppoint(attributes) {
    const mssql = this.mssql
    try {
      const inserted = await mssql("Appoint").insert(attributes, ["*"])
      return Promise.resolve(inserted)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async updateAppoint(attributes, condition) {
    const mssql = this.mssql
    try {
      const updated = await mssql("Appoint")
        .where(condition)
        .update(attributes, ["*"])
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async insertHoliday(attributes) {
    const db_queue = this.db_queue
    try {
      const inserted = await db_queue("tbl_holiday").insert(attributes)
      return Promise.resolve(inserted[0])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async updateHoliday(attributes, condition) {
    const db_queue = this.db_queue
    try {
      const updated = await db_queue("tbl_holiday")
        .where(condition)
        .update(attributes)
      return Promise.resolve(updated[0])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelHoliday(condition) {
    const db_queue = this.db_queue
    try {
      const row = await db_queue
        .select("*")
        .from("tbl_holiday")
        .where(condition)
        .first()
      return Promise.resolve(row)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findAllHoliday(condition) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select("*")
        .from("tbl_holiday")
        .whereBetween("holiday_date", [condition.startDate, condition.endDate])
        .orderBy("holiday_date", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async deleteHoliday(id) {
    const db_queue = this.db_queue
    try {
      const deleted = await db_queue("tbl_holiday")
        .where("id", id)
        .del()
      return Promise.resolve(deleted)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async deleteAppoint(condition) {
    const mssql = this.mssql
    try {
      const deleted = await mssql("Appoint")
        .where(condition)
        .del()
      return Promise.resolve(deleted)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = AppointmentService
