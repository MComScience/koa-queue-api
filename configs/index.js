"use strict"

const { typeCast } = require("../utils")

module.exports = {
  corsOptions: {
    origins: ["*"],
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Token-Header", "x-access-token"],
    exposeHeaders: ["Content-Length", "Date", "X-Request-Id"]
  },
  sessionOptions: {
    key: "koa:sess",
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  mysqlOptions: {
    client: process.env.MYSQL_CLIENT,
    connection: {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      port: process.env.MYSQL_PORT,
      database: process.env.MYSQL_DATABASE,
      typeCast: typeCast,
      debug: false
    },
    pool: { min: 0, max: 10 },
    asyncStackTraces: true,
    useNullAsDefault: true
  },
  mysqlBackendKioskOptions: {
    client: process.env.MYSQL_KIOSK_CLIENT,
    connection: {
      host: process.env.MYSQL_KIOSK_HOST,
      user: process.env.MYSQL_KIOSK_USER,
      password: process.env.MYSQL_KIOSK_PASSWORD,
      port: process.env.MYSQL_KIOSK_PORT,
      database: process.env.MYSQL_KIOSK_DATABASE,
      typeCast: typeCast,
      debug: false
    },
    pool: {
      min: 0,
      max: 10
    },
    asyncStackTraces: true,
    useNullAsDefault: true
  },
  mysqlQueueOptions: {
    client: process.env.MYSQL_QUEUE_CLIENT,
    connection: {
      host: process.env.MYSQL_QUEUE_HOST,
      user: process.env.MYSQL_QUEUE_USER,
      password: process.env.MYSQL_QUEUE_PASSWORD,
      port: process.env.MYSQL_QUEUE_PORT,
      database: process.env.MYSQL_QUEUE_DATABASE,
      // typeCast: typeCast,
      debug: false
    },
    pool: { min: 0, max: 10 },
    asyncStackTraces: true,
    useNullAsDefault: true
  },
  mssqlOptions: {
    client: process.env.MSSQL_CLIENT,
    connection: {
      host: process.env.MSSQL_HOST,
      user: process.env.MSSQL_USER,
      password: process.env.MSSQL_PASSWORD,
      database: process.env.MSSQL_DATABASE,
      port: parseInt(process.env.MSSQL_PORT),
      options: {
        encrypt: false,
        enableArithAbort: false
      }
    },
    asyncStackTraces: true,
    useNullAsDefault: true
  },
  socketOptions: {
    path: "/websocket"
  },
  socketEvents: {
    // ลงทะเบียนคิว
    REGISTER_QUEUE: "register queue",
    // แก้ไขรายการคิว
    UPDATE_QUEUE: "update queue",
    // ลบรายการคิว
    DELETE_QUEUE: "delete queue",
    // เรียกคิว
    ON_CALL_WAIT: "call wait",
    // พักคิว
    ON_HOLD_WAIT: "hold wait",
    // เสร็จสิ้นคิว
    ON_END_WAIT: "end wait",
    // เรียกคิวอีกครั้ง หรือ เรียกคิวซ้ำ
    ON_RECALL: "recall",
    // พักคิว
    ON_HOLD: "hold",
    // เสร็จสิ้นคิว
    ON_END: "end",
    // ใบสั่งยามีปัญหา
    ON_PROBLEM_PRESCRIPTION: "problem prescription",

    // สถานะเครื่องอ่านบัตรกำลังเชื่อมต่อ
    DEVICE_CONNECTED: "DEVICE_CONNECTED",
    // เครื่องอ่านบัตร ปชช ไม่เชื่อมต่อ
    DEVICE_DISCONNECTED: "DEVICE_DISCONNECTED",
    // เสียบบัตร ปชช
    CARD_INSERTED: "CARD_INSERTED",
    // ถอดบัตร ปชช
    CARD_REMOVED: "CARD_REMOVED",
    // เริ่มอ่านบัตร ปชช
    READING_START: "READING_START",
    // กำลังอ่านข้อมูลบัตร ปชช
    READING_PROGRESS: "READING_PROGRESS",
    // อ่านบัตร ปชช สำเร็จ
    READING_COMPLETE: "READING_COMPLETE",
    // อ่านบัตร ปชช ไม่สำเร็จ
    READING_FAIL: "READING_FAIL",
    // เวลา
    CLOCK: "clock",
    // เล่นเสียงเรียกคิว
    AUDIO_PLAYING: "audio playing",
    // เล่นเสียงเรียกคิวเสร็จสิ้น
    AUDIO_ENDED: "audio ended",
    // ตั้งค่าระบบ
    SETTINGS: "settings",
    // พิมพ์บัตรคิว
    PRINTING_QUEUE: "printing queue",
    // พิมพ์บัตรคิว ผู้ป่วยที่มีปัญหา
    PRINTING_ERROR: "printing error"
  }
}
