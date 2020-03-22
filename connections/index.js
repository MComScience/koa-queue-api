"use strict"

const mssql = require("./mssql")
const mysql = require("./mysql")
const mongoose = require("./mongoose")
const redisClient = require("./redis")
const soap = require("./soap")

const { mssqlOptions, mysqlBackendKioskOptions, mysqlQueueOptions, mysqlOptions } = require("../configs")

module.exports = {
  // ฐานข้อมูล รพ 192.168.0.3
  mssql: mssql(mssqlOptions),

  // ฐานข้อมูลพี่โอ๊ค
  db_api_udh: mysql(mysqlBackendKioskOptions),

  // ฐาน้อมูลระบบคิว
  db_queue: mysql(mysqlQueueOptions),

  // ฐานข้อมูลระบบนัด
  mysql: mysql(mysqlOptions),

  // oauth2 server
  mongoose: mongoose,

  // redis cache database
  redis: redisClient,

  // api ตรวจสอบสิทธิ
  soapClient: soap({
    url: process.env.SOAP_CLIENT_URL,
    options: {}
  })
}
