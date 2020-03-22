"use strict"

class QueueService {
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

  async getDataQueueTodayByHn(params) {
    try {
      const db_queue = this.db_queue
      const rows = await db_queue
        .select(
          "tbl_queue_detail.*",
          "tbl_queue.queue_no",
          "tbl_queue.patient_id",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_service.service_id",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service.service_group_id",
          "tbl_service.prefix_id",
          "tbl_service.service_num_digit",
          "tbl_service.ticket_id",
          "tbl_service.print_copy_qty",
          "tbl_service.floor_id",
          "tbl_service.service_order",
          "tbl_service.service_status",
          "tbl_service.icon_path",
          "tbl_service.icon_base_url",
          "tbl_service_group.service_group_name",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as created_at"),
          db_queue.raw("DATE_FORMAT(tbl_queue_detail.created_at,'%H:%i') as print_time"),
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name",
          "tbl_counter_service.counter_service_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "file_storage_item.base_url",
          "file_storage_item.path"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .leftJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .leftJoin("tbl_caller", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .leftJoin("tbl_counter_service", "tbl_caller.counter_service_id", "tbl_counter_service.counter_service_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .where({ "tbl_patient.hn": params.hn })
        .whereBetween("tbl_queue_detail.created_at", [params.startDate, params.endDate])
        .whereRaw("tbl_queue_detail.queue_status_id <> ?", [5])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue.created_at", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findDataQRCode(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_queue_detail.*",
          "tbl_queue.queue_no",
          "tbl_queue.patient_id",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_service.service_id",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service.service_group_id",
          "tbl_service.prefix_id",
          "tbl_service.service_num_digit",
          "tbl_service.ticket_id",
          "tbl_service.print_copy_qty",
          "tbl_service.floor_id",
          "tbl_service.service_order",
          "tbl_service.service_status",
          "tbl_service.icon_path",
          "tbl_service.icon_base_url",
          "tbl_service_group.service_group_name",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as created_at"),
          db_queue.raw("DATE_FORMAT(tbl_queue_detail.created_at,'%H:%i') as print_time"),
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter_service.counter_service_no",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_caller.caller_id"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .leftJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .leftJoin("tbl_caller", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .leftJoin("tbl_counter_service", "tbl_caller.counter_service_id", "tbl_counter_service.counter_service_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .where({ "tbl_queue_detail.queue_detail_id": params.id })
        .whereBetween("tbl_queue_detail.created_at", [params.startDate, params.endDate])
        .whereNotIn("tbl_queue_detail.queue_status_id", [5])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue.created_at", "asc")
        .first()
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataWait(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_queue_detail.queue_detail_id",
          "tbl_queue.queue_no",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "tbl_queue.created_at",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_coming_type.coming_type_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time")
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .where({
          "tbl_queue_detail.queue_status_id": 1,
          "tbl_queue_detail.service_type_id": params.service_type_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue.created_at", "asc")
        .orderBy("tbl_queue.queue_type_id", "desc")

      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataWaitById(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_queue_detail.queue_detail_id",
          "tbl_queue.queue_no",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "tbl_queue.created_at",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_coming_type.coming_type_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time")
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .where({
          "tbl_queue_detail.queue_status_id": 1,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_queue_detail.queue_detail_id": params.queue_detail_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue.created_at", "asc")
        .orderBy("tbl_queue.queue_type_id", "desc")

      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataCall(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_counter.counter_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          "tbl_queue.created_at",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .where({
          "tbl_queue_detail.queue_status_id": 2,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_caller.counter_service_id": params.counter_service_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.call_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataCallHistoryById(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_counter.counter_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .where({
          "tbl_queue_detail.queue_status_id": 2,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_caller.counter_service_id": params.counter_service_id,
          "tbl_caller.caller_id": params.caller_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.call_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataHold(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_counter.counter_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .where({
          "tbl_queue_detail.queue_status_id": 3,
          "tbl_queue_detail.service_type_id": params.service_type_id
          // "tbl_caller.counter_service_id": params.counter_service_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.hold_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataHoldById(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_counter.counter_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .where({
          "tbl_queue_detail.queue_status_id": 3,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          // "tbl_caller.counter_service_id": params.counter_service_id
          "tbl_caller.caller_id": params.caller_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.hold_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataEndHistory(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_counter.counter_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .where({
          "tbl_queue_detail.queue_status_id": 4,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_caller.counter_service_id": params.counter_service_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.end_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataWaitExamination(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_queue_detail.queue_detail_id",
          "tbl_queue.queue_no",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_coming_type.coming_type_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin(
          "tbl_counter_service",
          "tbl_counter_service.counter_service_id",
          "tbl_queue_detail.counter_service_id"
        )
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .innerJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .where({
          "tbl_queue_detail.queue_status_id": 1,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_queue_detail.counter_service_id": params.counter_service_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue.created_at", "asc")
        .orderBy("tbl_queue.queue_type_id", "desc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataWaitExaminationById() {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_queue_detail.queue_detail_id",
          "tbl_queue.queue_no",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_coming_type.coming_type_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin(
          "tbl_counter_service",
          "tbl_counter_service.counter_service_id",
          "tbl_queue_detail.counter_service_id"
        )
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .innerJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .where({
          "tbl_queue_detail.queue_status_id": 1,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_queue_detail.counter_service_id": params.counter_service_id,
          "tbl_queue_detail.queue_detail_id": params.queue_detail_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue.created_at", "asc")
        .orderBy("tbl_queue.queue_type_id", "desc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataCallExamination(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .innerJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .where({
          "tbl_queue_detail.queue_status_id": 2,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_caller.counter_service_id": params.counter_service_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.call_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataCallExaminationById(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .innerJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .where({
          "tbl_queue_detail.queue_status_id": 2,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_caller.counter_service_id": params.counter_service_id,
          "tbl_caller.caller_id": params.caller_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.call_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataHoldExamination(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .innerJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .where({
          "tbl_queue_detail.queue_status_id": 3,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_caller.counter_service_id": params.counter_service_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.hold_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataHoldExaminationById(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .innerJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .where({
          "tbl_queue_detail.queue_status_id": 3,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_caller.counter_service_id": params.counter_service_id,
          "tbl_caller.caller_id": params.caller_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.hold_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataWaitMedicine(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_queue_detail.queue_detail_id",
          "tbl_queue.queue_no",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service.prefix_id",
          "tbl_service_group.service_group_name",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_coming_type.coming_type_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_prefix.prefix_code"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_prefix", "tbl_prefix.prefix_id", "tbl_service.prefix_id")
        .where({
          "tbl_queue_detail.queue_status_id": 1,
          "tbl_queue_detail.service_type_id": params.service_type_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue.created_at", "asc")
        .orderBy("tbl_queue.queue_type_id", "desc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataWaitMedicineById(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_queue_detail.queue_detail_id",
          "tbl_queue.queue_no",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service.prefix_id",
          "tbl_service_group.service_group_name",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_coming_type.coming_type_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_prefix.prefix_code"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_prefix", "tbl_prefix.prefix_id", "tbl_service.prefix_id")
        .where({
          "tbl_queue_detail.queue_status_id": 1,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_queue_detail.queue_detail_id": params.queue_detail_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue.created_at", "asc")
        .orderBy("tbl_queue.queue_type_id", "desc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataCallMedicine(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_counter.counter_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service.prefix_id",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_prefix.prefix_code"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .innerJoin("tbl_prefix", "tbl_prefix.prefix_id", "tbl_service.prefix_id")
        .where({
          "tbl_queue_detail.queue_status_id": 2,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_caller.counter_service_id": params.counter_service_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.call_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataCallMedicineById(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_counter.counter_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service.prefix_id",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_prefix.prefix_code"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .innerJoin("tbl_prefix", "tbl_prefix.prefix_id", "tbl_service.prefix_id")
        .where({
          "tbl_queue_detail.queue_status_id": 2,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_caller.counter_service_id": params.counter_service_id,
          "tbl_caller.caller_id": params.caller_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.call_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataHoldMedicine(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_counter.counter_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service.prefix_id",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_prefix.prefix_code"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .innerJoin("tbl_prefix", "tbl_prefix.prefix_id", "tbl_service.prefix_id")
        .where({
          "tbl_queue_detail.queue_status_id": 3,
          "tbl_queue_detail.service_type_id": params.service_type_id
          // "tbl_caller.counter_service_id": params.counter_service_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.hold_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataHoldMedicineById(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_caller.caller_id",
          "tbl_counter.counter_id",
          "tbl_caller.counter_service_id",
          "tbl_caller.profile_service_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_caller.queue_detail_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service.prefix_id",
          "tbl_service_group.service_group_name",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_prefix.prefix_code"
        )
        .from("tbl_caller")
        .innerJoin("tbl_queue_detail", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin("tbl_counter_service", "tbl_counter_service.counter_service_id", "tbl_caller.counter_service_id")
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .innerJoin("tbl_prefix", "tbl_prefix.prefix_id", "tbl_service.prefix_id")
        .where({
          "tbl_queue_detail.queue_status_id": 3,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          // "tbl_caller.counter_service_id": params.counter_service_id
          "tbl_caller.caller_id": params.caller_id
        })
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .whereBetween("tbl_caller.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_caller.caller_id")
        .orderBy("tbl_caller.hold_time", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /* async findModelQueueDetail(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_queue_detail")
        .where({
          queue_detail_id: id
        })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  } */

  async deleteQueue(params) {
    const db_queue = this.db_queue
    try {
      const updated = await db_queue("tbl_queue_detail")
        .where({
          queue_detail_id: params.id
        })
        .update({
          queue_status_id: 5,
          updated_at: params.updated_at,
          updated_by: params.updated_by
        })
      if (updated.parent_id) {
        db_queue("tbl_queue_detail")
          .where({
            queue_detail_id: updated.parent_id
          })
          .update({
            examination_status: null,
            updated_at: params.updated_at,
            updated_by: params.updated_by
          })
      }
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelPatientById(id) {
    const db_queue = this.db_queue
    try {
      const patient = await db_queue
        .select("*")
        .from("tbl_patient")
        .where({
          patient_id: id
        })
        .first()
      return Promise.resolve(patient)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async updatePatient(params) {
    const db_queue = this.db_queue
    try {
      const updated = await db_queue("tbl_patient")
        .where({
          patient_id: params.parent_id
        })
        .update(params)
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async insertQueueFailed(params) {
    const db_queue = this.db_queue
    try {
      const inserted = await db_queue.insert(params).into("tbl_queue_failed")
      return Promise.resolve(inserted)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataQueueList(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_queue_detail.queue_detail_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.doctor_id",
          "tbl_queue_detail.examination_status",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_patient.patient_id",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "tbl_service.service_name",
          "tbl_queue.created_at",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "profile.name",
          "tbl_queue_status.queue_status_name",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_coming_type.icon_path",
          "tbl_coming_type.icon_base_url",
          "tbl_service_type.service_type_name",
          "tbl_queue.appoint_id",
          "tbl_service_group.service_group_name",
          "tbl_queue_detail.counter_service_id",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_counter_service.counter_service_name",
          "tbl_caller.caller_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_service_type", "tbl_service_type.service_type_id", "tbl_queue_detail.service_type_id")
        .leftJoin("tbl_caller", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .leftJoin("tbl_counter_service", "tbl_caller.counter_service_id", "tbl_counter_service.counter_service_id")
        .leftJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .whereIn("tbl_queue_detail.queue_status_id", [1, 2, 3, 4])
        .whereBetween("tbl_queue_detail.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue_detail.created_at", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataQueueListById(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_queue_detail.queue_detail_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.doctor_id",
          "tbl_queue_detail.examination_status",
          "tbl_queue.queue_no",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_patient.patient_id",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "tbl_service.service_name",
          "tbl_queue.created_at",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          "profile.name",
          "tbl_queue_status.queue_status_name",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_coming_type.icon_path",
          "tbl_coming_type.icon_base_url",
          "tbl_service_type.service_type_name",
          "tbl_queue.appoint_id",
          "tbl_service_group.service_group_name",
          "tbl_queue_detail.counter_service_id",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_counter_service.counter_service_name",
          "tbl_caller.caller_id",
          db_queue.raw("DATE_FORMAT(tbl_caller.call_time,'%H:%i') as call_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.hold_time,'%H:%i') as hold_time"),
          db_queue.raw("DATE_FORMAT(tbl_caller.end_time,'%H:%i') as end_time"),
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_service_type", "tbl_service_type.service_type_id", "tbl_queue_detail.service_type_id")
        .leftJoin("tbl_caller", "tbl_queue_detail.queue_detail_id", "tbl_caller.queue_detail_id")
        .leftJoin("tbl_counter_service", "tbl_caller.counter_service_id", "tbl_counter_service.counter_service_id")
        .leftJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .where({
          "tbl_queue_detail.queue_detail_id": params.queue_detail_id
        })
        .whereIn("tbl_queue_detail.queue_status_id", [1, 2, 3, 4])
        .whereBetween("tbl_queue_detail.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue_detail.created_at", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataQueueExToday(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_queue_detail.*",
          "tbl_queue.queue_no",
          "tbl_queue.patient_id",
          "tbl_queue.queue_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.coming_type_id",
          "tbl_service.service_id",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service.service_group_id",
          "tbl_service.prefix_id",
          "tbl_service.service_num_digit",
          "tbl_service.ticket_id",
          "tbl_service.print_copy_qty",
          "tbl_service.floor_id",
          "tbl_service.service_order",
          "tbl_service.service_status",
          "tbl_service.icon_path",
          "tbl_service.icon_base_url",
          "tbl_service_group.service_group_name",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as print_time"),
          db_queue.raw("DATE_FORMAT(tbl_queue.created_at,'%H:%i') as created_at"),
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_coming_type.coming_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name",
          "tbl_counter_service.counter_service_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "file_storage_item.base_url",
          "file_storage_item.path"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .leftJoin(
          "tbl_counter_service",
          "tbl_counter_service.counter_service_id",
          "tbl_queue_detail.counter_service_id"
        )
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .where({
          "tbl_patient.hn": params.hn,
          "tbl_queue_detail.service_type_id": 2
        })
        .whereBetween("tbl_queue_detail.created_at", [params.startDate, params.endDate])
        .whereNotIn("tbl_queue_detail.queue_status_id", [5])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue.created_at", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async searchPatient(params) {
    const db_queue = this.db_queue
    try {
      const row = await db_queue
        .select(
          "tbl_queue_detail.queue_detail_id",
          "tbl_queue.queue_no",
          "tbl_patient.patient_id",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "tbl_queue.created_at",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_coming_type.coming_type_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .whereIn("tbl_queue_detail.queue_status_id", [1, 2, 3, 4])
        .whereIn("tbl_queue_detail.service_id", params.service_ids)
        .where({
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_patient.hn": params.q
        })
        .orWhere("tbl_queue.queue_no", params.q)
        .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .first()
      return Promise.resolve(row)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getMedSchedulesByService(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_med_schedule.*",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name",
          "tbl_counter_service.counter_service_id",
          "tbl_counter_service.counter_service_name",
          "tbl_counter_service.counter_service_no",
          "tbl_service.service_name"
        )
        .from("tbl_med_schedule")
        .innerJoin("tbl_doctor", "tbl_med_schedule.doctor_id", "tbl_doctor.doctor_id")
        .innerJoin(
          "tbl_counter_service",
          "tbl_counter_service.counter_service_id",
          "tbl_med_schedule.counter_service_id"
        )
        .innerJoin("tbl_service", "tbl_med_schedule.service_id", "tbl_service.service_id")
        .where({
          "tbl_med_schedule.schedule_date": params.schedule_date,
          "tbl_med_schedule.med_schedule_status": 1,
          "tbl_counter_service.counter_service_status": 1
        })
        .whereIn("tbl_med_schedule.service_id", params.service_ids)
        .orderBy("tbl_med_schedule.service_id", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataWaitExaminationOfDoctor(params) {
    const db_queue = this.db_queue
    try {
      const count = await db_queue
        .select(
          "tbl_queue_detail.queue_detail_id",
          "tbl_queue.queue_no",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "tbl_queue.created_at",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_coming_type.coming_type_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin(
          "tbl_counter_service",
          "tbl_counter_service.counter_service_id",
          "tbl_queue_detail.counter_service_id"
        )
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .innerJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .where({
          "tbl_queue_detail.queue_status_id": 1,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_queue_detail.counter_service_id": params.counter_service_id,
          "tbl_queue_detail.doctor_id": params.doctor_id,
          "tbl_queue_detail.service_id": params.service_id
        })
        .whereIn("tbl_queue_detail.duration_time", params.duration_time)
        .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue.created_at", "asc")
        .orderBy("tbl_queue.queue_type_id", "desc")
      return Promise.resolve(count)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findAudioPlayer() {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select("*")
        .from("tbl_audio_player")
        .where({
          audio_player_status: 1
        })
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findOneModelCaller(id) {
    const db_queue = this.db_queue
    try {
      const row = await db_queue
        .select("*")
        .from("tbl_caller")
        .where({
          caller_id: id
        })
        .first()
      return Promise.resolve(row)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async UpdateStatusCall(params) {
    const db_queue = this.db_queue
    try {
      const updated = await db_queue("tbl_caller")
        .where({
          caller_id: params.caller_id
        })
        .update({
          caller_status: 1,
          updated_at: params.updated_at,
          updated_by: params.updated_by
        })
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async checkQueueExamination(params) {
    try {
      const db_queue = this.db_queue
      const rows = await db_queue
        .select("*")
        .from("tbl_queue_detail")
        .where({
          parent_id: params.id
        })
        .whereBetween("created_at", [params.startDate, params.endDate])
        .first()
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async countWaitingQrcode(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_queue_detail.queue_detail_id",
          "tbl_queue.queue_no",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "tbl_queue_detail.examination_status",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "tbl_queue.created_at",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_coming_type.coming_type_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .where({
          "tbl_queue_detail.queue_status_id": 1,
          "tbl_queue_detail.service_id": params.service_id,
          "tbl_queue_detail.service_type_id": params.service_type_id
        })
        .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
        .whereRaw("tbl_queue_detail.queue_detail_id < ?", [params.queue_detail_id])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue.created_at", "asc")
        .orderBy("tbl_queue.queue_type_id", "desc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelQueueById(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_queue")
        .where({
          queue_id: id
        })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelCallerByQueueId(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_caller")
        .where({
          queue_detail_id: id
        })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelProfileServiceById(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_profile_service")
        .where({
          profile_service_id: id
        })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelCounterServiceById(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_counter_service")
        .where({
          counter_service_id: id
        })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelServiceById(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_service")
        .where({
          service_id: id
        })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelServiceGroupById(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_service_group")
        .where({
          service_group_id: id
        })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async insertCaller(params) {
    const db_queue = this.db_queue
    try {
      const inserted = await db_queue("tbl_caller").insert(params)
      return Promise.resolve(inserted[0])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelCallerById(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_caller")
        .where({
          caller_id: id
        })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async updateQueueDetail(id, params) {
    const db_queue = this.db_queue
    try {
      const queue_detail_id = await db_queue("tbl_queue_detail")
        .where({ queue_detail_id: id })
        .update(params)
      return Promise.resolve(queue_detail_id)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelAudioFileById(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_audio_file")
        .where({
          audio_file_id: id
        })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async updateCaller(id, params) {
    const db_queue = this.db_queue
    try {
      const updated = await db_queue("tbl_caller")
        .where({ caller_id: id })
        .update(params)
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelPrefixById(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_prefix")
        .where({
          prefix_id: id
        })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findOneScheduleSetting(condition) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_schedule_setting")
        .where(condition)
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelKioskById(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_kiosk")
        .where({ kiosk_id: id })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findOldPatient(params) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_patient")
        .where({ hn: params.hn })
        .whereBetween("created_at", [params.startDate, params.endDate])
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findPatientById(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_patient")
        .where({ patient_id: id })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findOnePatient(condition) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_patient")
        .where(condition)
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async insertPatient(params) {
    const db_queue = this.db_queue
    try {
      const inserted = await db_queue("tbl_patient").insert(params)
      return Promise.resolve(inserted[0])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async updatePatient(id, attributes) {
    const db_queue = this.db_queue
    try {
      const updated = await db_queue("tbl_patient")
        .where({
          patient_id: id
        })
        .update(attributes)
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async insertFileStorageItem(params) {
    const db_queue = this.db_queue
    try {
      const inserted = await db_queue("file_storage_item").insert(params)
      return Promise.resolve(inserted[0])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async deleteFileStorageItem(condition) {
    const db_queue = this.db_queue
    try {
      const deleted = await db_queue("file_storage_item")
        .where(condition)
        .del()
      return Promise.resolve(deleted)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findFileStorageItemById(id) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("file_storage_item")
        .where({ id: id })
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findOneAppoint(condition) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_appoint")
        .where(condition)
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async insertAppoint(params) {
    const db_queue = this.db_queue
    try {
      const inserted = await db_queue("tbl_appoint").insert(params)
      return Promise.resolve(inserted[0])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getQueueToday(params) {
    const db_queue = this.db_queue
    try {
      const patient = await db_queue
        .select("tbl_queue_detail.*")
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .where({
          "tbl_queue_detail.service_group_id": params.service_group_id,
          "tbl_queue_detail.service_id": params.service_id,
          "tbl_patient.hn": params.hn,
          "tbl_queue_detail.service_type_id": params.service_type_id
        })
        .whereBetween("tbl_queue_detail.created_at", [params.startDate, params.endDate])
        .whereNotIn("tbl_queue_detail.queue_status_id", [5])
        .orderBy("tbl_queue_detail.created_at", "asc")
        .first()
      return Promise.resolve(patient)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findLastQueue(condition) {
    const db_queue = this.db_queue
    try {
      if (condition.prefix_succession === 1) {
        const result = await db_queue
          .select("*")
          .from("tbl_auto_number")
          .where({
            prefix_id: condition.prefix_id,
            service_group_id: condition.service_group_id,
            appoint_split: condition.appoint_split,
            prefix_succession: condition.prefix_succession,
            updated_at: condition.updated_at
          })
          .first()
        return Promise.resolve(result)
      } else {
        const result = await db_queue
          .select("*")
          .from("tbl_auto_number")
          .where({
            prefix_id: condition.prefix_id,
            service_group_id: condition.service_group_id,
            service_id: condition.service_id,
            appoint_split: condition.appoint_split,
            prefix_succession: condition.prefix_succession,
            updated_at: condition.updated_at
          })
          .first()
        return Promise.resolve(result)
      }
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async insertQueue(attributes) {
    const db_queue = this.db_queue
    try {
      const inserted = await db_queue("tbl_queue").insert(attributes)
      return Promise.resolve(inserted[0])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async updateQueue(condition, attributes) {
    const db_queue = this.db_queue
    try {
      const updated = await db_queue("tbl_queue")
        .where(condition)
        .update(attributes)
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async insertAutoNumber(attributes) {
    const db_queue = this.db_queue
    try {
      const inserted = await db_queue("tbl_auto_number").insert(attributes)
      return Promise.resolve(inserted[0])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async updateAutoNumber(condition, attributes) {
    const db_queue = this.db_queue
    try {
      const updated = await db_queue("tbl_auto_number")
        .where(condition)
        .update(attributes)
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelQueue(condition) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_queue")
        .where(condition)
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelQueueDetail(condition) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_queue_detail")
        .where(condition)
        .whereNotIn("tbl_queue_detail.queue_status_id", [5])
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async insertQueueDetail(attributes) {
    const db_queue = this.db_queue
    try {
      const inserted = await db_queue("tbl_queue_detail").insert(attributes)
      return Promise.resolve(inserted[0])
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async updateQueueDetail(condition, attributes) {
    const db_queue = this.db_queue
    try {
      const updated = await db_queue("tbl_queue_detail")
        .where(condition)
        .update(attributes)
      return Promise.resolve(updated)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findOneServiceSchedule(condition) {
    const db_queue = this.db_queue
    try {
      const result = await db_queue
        .select("*")
        .from("tbl_service_schedule")
        .where(condition)
        .first()
      return Promise.resolve(result)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getCounters(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select("tbl_service_schedule_detail.*", "tbl_counter_service.counter_service_name")
        .from("tbl_service_schedule_detail")
        .innerJoin(
          "tbl_counter_service",
          "tbl_service_schedule_detail.counter_service_id",
          "tbl_counter_service.counter_service_id"
        )
        .where({
          "tbl_service_schedule_detail.service_schedule_id": params.service_schedule_id
        })
        .orderBy("tbl_counter_service.counter_service_no", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataWaitCalculateHistory(params) {
    const db_queue = this.db_queue
    try {
      let rows = []
      // ถ้ามีนัด
      if (params.appointment && params.appointment !== "all") {
        rows = await db_queue
          .select(
            "tbl_queue_detail.queue_detail_id",
            "tbl_queue.queue_no",
            "tbl_patient.hn",
            "tbl_patient.fullname",
            "tbl_queue.queue_type_id",
            "tbl_queue.coming_type_id",
            "tbl_queue.appoint_id",
            "tbl_queue.service_point_id",
            "tbl_queue_detail.queue_id",
            "tbl_queue_detail.service_group_id",
            "tbl_queue_detail.service_id",
            "tbl_queue_detail.service_type_id",
            "tbl_queue_detail.queue_status_id",
            "file_storage_item.base_url",
            "file_storage_item.path",
            "tbl_service.service_code",
            "tbl_service.service_name",
            "tbl_service_group.service_group_name",
            "tbl_queue.created_at",
            "profile.name",
            "tbl_queue_type.queue_type_name",
            "tbl_queue_status.queue_status_name",
            "tbl_service_point.service_point_name",
            "tbl_coming_type.coming_type_name",
            "tbl_appoint.appoint_date",
            "tbl_appoint.app_time_from",
            "tbl_appoint.app_time_to",
            "tbl_appoint.doc_code",
            "tbl_appoint.doc_name"
          )
          .from("tbl_queue_detail")
          .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
          .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
          .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
          .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
          .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
          .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
          .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
          .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
          .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
          .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
          .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
          .where({
            "tbl_queue_detail.queue_status_id": 1,
            "tbl_queue_detail.service_id": params.service_id,
            "tbl_queue_detail.service_type_id": params.service_type_id
          })
          .whereIn("tbl_queue.coming_type_id", params.coming_type_ids)
          .whereIn("tbl_queue.queue_type_id", params.queue_type_ids)
          .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
          .whereRaw("tbl_queue_detail.queue_detail_id < ?", [params.queue_detail_id])
          .whereRaw("tbl_queue.appoint_id <> ?", [null])
          .groupBy("tbl_queue_detail.queue_detail_id")
          .orderBy("tbl_queue.created_at", "asc")
          .orderBy("tbl_queue.queue_type_id", "desc")
      } else if (!params.appointment && params.appointment !== "all") {
        rows = await db_queue
          .select(
            "tbl_queue_detail.queue_detail_id",
            "tbl_queue.queue_no",
            "tbl_patient.hn",
            "tbl_patient.fullname",
            "tbl_queue.queue_type_id",
            "tbl_queue.coming_type_id",
            "tbl_queue.appoint_id",
            "tbl_queue.service_point_id",
            "tbl_queue_detail.queue_id",
            "tbl_queue_detail.service_group_id",
            "tbl_queue_detail.service_id",
            "tbl_queue_detail.service_type_id",
            "tbl_queue_detail.queue_status_id",
            "file_storage_item.base_url",
            "file_storage_item.path",
            "tbl_service.service_code",
            "tbl_service.service_name",
            "tbl_service_group.service_group_name",
            "tbl_queue.created_at",
            "profile.name",
            "tbl_queue_type.queue_type_name",
            "tbl_queue_status.queue_status_name",
            "tbl_service_point.service_point_name",
            "tbl_coming_type.coming_type_name",
            "tbl_appoint.appoint_date",
            "tbl_appoint.app_time_from",
            "tbl_appoint.app_time_to",
            "tbl_appoint.doc_code",
            "tbl_appoint.doc_name"
          )
          .from("tbl_queue_detail")
          .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
          .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
          .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
          .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
          .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
          .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
          .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
          .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
          .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
          .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
          .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
          .where({
            "tbl_queue_detail.queue_status_id": 1,
            "tbl_queue_detail.service_id": params.service_id,
            "tbl_queue_detail.service_type_id": params.service_type_id,
            "tbl_queue.appoint_id": null
          })
          .whereIn("tbl_queue.coming_type_id", params.coming_type_ids)
          .whereIn("tbl_queue.queue_type_id", params.queue_type_ids)
          .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
          .whereRaw("tbl_queue_detail.queue_detail_id < ?", [params.queue_detail_id])
          .groupBy("tbl_queue_detail.queue_detail_id")
          .orderBy("tbl_queue.created_at", "asc")
          .orderBy("tbl_queue.queue_type_id", "desc")
      } else {
        rows = await db_queue
          .select(
            "tbl_queue_detail.queue_detail_id",
            "tbl_queue.queue_no",
            "tbl_patient.hn",
            "tbl_patient.fullname",
            "tbl_queue.queue_type_id",
            "tbl_queue.coming_type_id",
            "tbl_queue.appoint_id",
            "tbl_queue.service_point_id",
            "tbl_queue_detail.queue_id",
            "tbl_queue_detail.service_group_id",
            "tbl_queue_detail.service_id",
            "tbl_queue_detail.service_type_id",
            "tbl_queue_detail.queue_status_id",
            "file_storage_item.base_url",
            "file_storage_item.path",
            "tbl_service.service_code",
            "tbl_service.service_name",
            "tbl_service_group.service_group_name",
            "tbl_queue.created_at",
            "profile.name",
            "tbl_queue_type.queue_type_name",
            "tbl_queue_status.queue_status_name",
            "tbl_service_point.service_point_name",
            "tbl_coming_type.coming_type_name",
            "tbl_appoint.appoint_date",
            "tbl_appoint.app_time_from",
            "tbl_appoint.app_time_to",
            "tbl_appoint.doc_code",
            "tbl_appoint.doc_name"
          )
          .from("tbl_queue_detail")
          .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
          .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
          .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
          .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
          .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
          .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
          .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
          .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
          .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
          .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
          .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
          .where({
            "tbl_queue_detail.queue_status_id": 1,
            "tbl_queue_detail.service_id": params.service_id,
            "tbl_queue_detail.service_type_id": params.service_type_id
          })
          .whereIn("tbl_queue.coming_type_id", params.coming_type_ids)
          .whereIn("tbl_queue.queue_type_id", params.queue_type_ids)
          .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
          .whereRaw("tbl_queue_detail.queue_detail_id < ?", [params.queue_detail_id])
          .groupBy("tbl_queue_detail.queue_detail_id")
          .orderBy("tbl_queue.created_at", "asc")
          .orderBy("tbl_queue.queue_type_id", "desc")
      }
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelCounterService(condition) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_counter_service")
        .where(condition)
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findModelDoctor(condition) {
    const db_queue = this.db_queue
    try {
      const queue = await db_queue
        .select("*")
        .from("tbl_doctor")
        .where(condition)
        .first()
      return Promise.resolve(queue)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findOneMedSchedule(condition) {
    const db_queue = this.db_queue
    try {
      const schedule = await db_queue
        .select("*")
        .from("tbl_med_schedule")
        .where(condition)
        .first()
      return Promise.resolve(schedule)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findAllMedScheduleTime(condition) {
    const db_queue = this.db_queue
    try {
      const schedules = await db_queue
        .select("*")
        .from("tbl_med_schedule_time")
        .where(condition)
        .orderBy("start_time", "asc")
      return Promise.resolve(schedules)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getDataWaitCalculateExamination(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select(
          "tbl_queue_detail.queue_detail_id",
          "tbl_queue.queue_no",
          "tbl_patient.hn",
          "tbl_patient.fullname",
          "tbl_queue.queue_type_id",
          "tbl_queue.coming_type_id",
          "tbl_queue.appoint_id",
          "tbl_queue.service_point_id",
          "tbl_queue_detail.queue_id",
          "tbl_queue_detail.service_group_id",
          "tbl_queue_detail.service_id",
          "tbl_queue_detail.service_type_id",
          "tbl_queue_detail.queue_status_id",
          "file_storage_item.base_url",
          "file_storage_item.path",
          "tbl_service.service_code",
          "tbl_service.service_name",
          "tbl_service_group.service_group_name",
          "tbl_queue.created_at",
          "profile.name",
          "tbl_queue_type.queue_type_name",
          "tbl_queue_status.queue_status_name",
          "tbl_service_point.service_point_name",
          "tbl_coming_type.coming_type_name",
          "tbl_counter_service.counter_service_name",
          "tbl_counter.counter_name",
          "tbl_appoint.appoint_date",
          "tbl_appoint.app_time_from",
          "tbl_appoint.app_time_to",
          "tbl_appoint.doc_code",
          "tbl_appoint.doc_name",
          "tbl_doctor.doctor_code",
          "tbl_doctor.doctor_title",
          "tbl_doctor.doctor_name"
        )
        .from("tbl_queue_detail")
        .innerJoin("tbl_queue", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .leftJoin("tbl_appoint", "tbl_appoint.appoint_id", "tbl_queue.appoint_id")
        .innerJoin("tbl_patient", "tbl_patient.patient_id", "tbl_queue.patient_id")
        .leftJoin("file_storage_item", "file_storage_item.ref_id", "tbl_patient.patient_id")
        .innerJoin("tbl_service", "tbl_service.service_id", "tbl_queue_detail.service_id")
        .innerJoin("tbl_service_group", "tbl_service_group.service_group_id", "tbl_service.service_group_id")
        .innerJoin("profile", "profile.user_id", "tbl_queue.created_by")
        .innerJoin("tbl_queue_type", "tbl_queue_type.queue_type_id", "tbl_queue.queue_type_id")
        .innerJoin("tbl_coming_type", "tbl_coming_type.coming_type_id", "tbl_queue.coming_type_id")
        .innerJoin("tbl_queue_status", "tbl_queue_status.queue_status_id", "tbl_queue_detail.queue_status_id")
        .innerJoin("tbl_service_point", "tbl_service_point.service_point_id", "tbl_queue.service_point_id")
        .innerJoin(
          "tbl_counter_service",
          "tbl_counter_service.counter_service_id",
          "tbl_queue_detail.counter_service_id"
        )
        .innerJoin("tbl_counter", "tbl_counter.counter_id", "tbl_counter_service.counter_id")
        .innerJoin("tbl_doctor", "tbl_doctor.doctor_id", "tbl_queue_detail.doctor_id")
        .where({
          "tbl_queue_detail.queue_status_id": 1,
          "tbl_queue_detail.service_id": params.service_id,
          "tbl_queue_detail.service_type_id": params.service_type_id,
          "tbl_queue_detail.counter_service_id": params.counter_service_id,
          "tbl_queue_detail.doctor_id": params.doctor_id,
          "tbl_queue_detail.duration_time": params.duration_time
        })
        .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
        .whereRaw("tbl_queue_detail.queue_detail_id < ?", [params.queue_detail_id])
        .groupBy("tbl_queue_detail.queue_detail_id")
        .orderBy("tbl_queue.created_at", "asc")
        .orderBy("tbl_queue.queue_type_id", "desc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async findOneModelStorage(condition) {
    const db_queue = this.db_queue
    try {
      const schedule = await db_queue
        .select("*")
        .from("file_storage_item")
        .where(condition)
        .first()
      return Promise.resolve(schedule)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async getWaitingCalculateMedicine(params) {
    const db_queue = this.db_queue
    try {
      const rows = await db_queue
        .select("tbl_queue.*")
        .from("tbl_queue")
        .innerJoin("tbl_queue_detail", "tbl_queue.queue_id", "tbl_queue_detail.queue_id")
        .where({
          "tbl_queue_detail.service_id": params.service_id,
          "tbl_queue_detail.service_type_id": 3,
          "tbl_queue_detail.queue_status_id": 1
        })
        .whereRaw("UNIX_TIMESTAMP(tbl_queue_detail.created_at) < ?", [params.created_at_unix])
        .whereRaw("tbl_queue.queue_id < ?", [params.queue_id])
        .whereBetween("tbl_queue.created_at", [params.startDate, params.endDate])
        .groupBy("tbl_queue.queue_id")
        .orderBy("tbl_queue.queue_id", "asc")
        .orderBy("tbl_queue.created_at", "asc")
      return Promise.resolve(rows)
    } catch (error) {
      return Promise.reject(error)
    }
  }
}

module.exports = QueueService
