"use strict"

const moment = require("moment")
const isEmpty = require("is-empty")
const sprintf = require("./sprintf")
const str_split = require("./str_split")
const unserialize = require("./unserialize")
const get = require("lodash/get")
moment.locale("th")

const getCurrentDate = () => {
  const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Bangkok", hour12: false }).replace(/,/g, "")
  return new Date(date)
}

const loggerTimes = () => {
  return `,"time":"${moment(getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")}"`
}

const typeCast = (field, next) => {
  if (field.type == "DATETIME") {
    return !isEmpty(field.string()) ? moment(field.string()).format("YYYY-MM-DD HH:mm:ss") : ""
  } else if (field.type == "DATE") {
    return !isEmpty(field.string()) ? moment(field.string()).format("YYYY-MM-DD") : ""
  }
  return next()
}

const getCurrentDateFormat = (format = "YYYY-MM-DD HH:mm:ss") => {
  return moment(getCurrentDate()).format(format)
}

const getYearThai = () => {
  return parseInt(moment(getCurrentDate()).format("YYYY")) + 543
}

let intervalSecond = null
let intervalMinute = null
let intervalHour = null

const clock = (socket, events) => {
  if (!socket) return
  let hour = "00"
  let minute = "00"
  let second = "00"
  if (intervalSecond) {
    clearInterval(intervalSecond)
  }
  if (intervalMinute) {
    clearInterval(intervalMinute)
  }
  if (intervalHour) {
    clearInterval(intervalHour)
  }
  intervalSecond = setInterval(function() {
    const b = parseFloat(getCurrentDateFormat("ss"))
    second = (b < 10 ? "0" : "") + b
  }, 1e3)
  intervalMinute = setInterval(function() {
    const c = parseFloat(getCurrentDateFormat("mm"))
    minute = (c < 10 ? "0" : "") + c
    if (second === "00" || second === 0) {
      const d = getCurrentDateFormat("HH")
      const data = {
        current_time: `${new String(d)}:${minute}`,
        hour: new String(d),
        minute: minute,
        second: second,
        current_date: getCurrentDateFormat("วันddddที่ DD MMMM ") + getYearThai(),
        today: getCurrentDateFormat()
      }
      socket.broadcast.emit(events.CLOCK, data)
    }
  }, 1e3)
  intervalHour = setInterval(function() {
    const d = parseFloat(getCurrentDateFormat("HH"))
    hour = (d < 10 ? "0" : "") + d
  }, 1e3)
}

const createHeadersObj = headers => {
  const newObject = {}
  for (var field in headers) {
    newObject[field] = headers[field]
  }
  return newObject
}

const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties
  }
}

const trimValue = (data, skipAttributes = []) => {
  if (isEmpty(data)) {
    if (typeof data === "object") {
      return data
    } else if (typeof data === "string") {
      return ""
    } else {
      return data
    }
  }
  if (Array.isArray(data)) {
    const newArray = data.map((currentValue, index, arr) => {
      if (typeof currentValue === "object") {
        return trimValue(currentValue, skipAttributes)
      } else if (typeof currentValue === "string") {
        return currentValue ? currentValue.replace(/\s+/g, "") : currentValue
      } else {
        return currentValue ? currentValue.replace(/\s+/g, "") : currentValue
      }
    })
    return newArray
  } else if (typeof data === "object") {
    const keys = Object.keys(data)
    if (!keys.length) return data
    const newObject = {}
    keys.map(k => {
      if (skipAttributes.includes(k)) {
        newObject[k] = data[k]
      } else if (data[k] && typeof data[k] === "string") {
        if (data[k]) {
          const newData = trimValue(
            data[k].split(" ").filter(arr => !isEmpty(arr)),
            skipAttributes
          )
          newObject[k] = newData.join(" ")
        } else {
          newObject[k] = data[k]
        }
      } else if (data[k] && typeof data[k] === "object") {
        newObject[k] = trimValue(data[k], skipAttributes)
      } else {
        newObject[k] = data[k]
      }
    })
    return newObject
  } else {
    return data.replace(/\s+/g, "")
  }
}

const mappingPaytype = (data, defaultValue = null) => {
  if (isEmpty(data)) return defaultValue
  return {
    payType: data.usrdrg,
    message: data.pay_typedes,
    right_status: 3
  }
}

const nextChar = c => {
  return String.fromCharCode(c.charCodeAt(0) + 1)
}

const genRegNo = regNo => {
  try {
    let newRegNo = "01"
    if (regNo) {
      if (regNo === "99" || regNo === "9Z") {
        return "A1"
      }
      if (regNo === "ZZ") {
        return "01"
      }

      let regNo_splt = str_split(regNo, 1)
      /* regNo_splt = regNo_splt.map(value => {
        if (/^\d+$/.test(value)) {
          return parseInt(value)
        }
        return value
      }) */
      let firstChar = regNo_splt[0]
      let secondChar = regNo_splt[1]

      if (/^\d+$/.test(firstChar)) {
        if (/^\d+$/.test(secondChar)) {
          newRegNo = parseInt(regNo) + 1
        } else {
          lastNo++
          newRegNo = `${firstChar}${secondChar}`
        }
      } else {
        if (/^\d+$/.test(secondChar)) {
          if ([9, "9"].includes(secondChar)) {
            return (newRegNo = `${firstChar}A`)
          }
          newRegNo = `${firstChar}${secondChar + 1}`
        } else {
          if (secondChar === "Z") {
            firstChar = nextChar(firstChar)
            return (newRegNo = `${firstChar}1`)
          }
          secondChar = nextChar(secondChar)
          newRegNo = `${firstChar}${secondChar}`
        }
      }
    }
    return sprintf("%02s", newRegNo)
  } catch (error) {
    throw new Error(error)
  }
}

const substrPayType = (hmain, pay_type) => {
  let contcode = ""
  if (hmain) return hmain
  if (/^\d+$/.test(pay_type)) return pay_type
  return contcode
}

const getTimeRanges = () => {
  let currentDate = moment(getCurrentDate()).format("YYYY-MM-DD 08:00:00")
  let times = []
  for (let i = 1; i <= 31; i++) {
    const date = moment(currentDate).add("30", "minutes")
    const end_time = moment(date).format("HH:mm")
    const range = {
      start_time: moment(currentDate).format("HH:mm"),
      end_time: end_time === "23:30" ? "00:00" : end_time
    }
    times.push(range)
    currentDate = moment(date).format("YYYY-MM-DD HH:mm:ss")
  }
  return times
}

const startDateNow = () => {
  return moment(getCurrentDate()).format("YYYY-MM-DD 00:00:01")
}

const endDateNow = () => {
  return moment(getCurrentDate()).format("YYYY-MM-DD 23:59:59")
}

const getAppointStatus = appoint => {
  return isEmpty(appoint) ? "ไม่มีนัด" : "มีนัด"
}

const randomString = () => {
  return (
    Math.random()
      .toString(36)
      .substring(2, 15) +
    Math.random()
      .toString(36)
      .substring(2, 15)
  )
}

const createdAt = () => {
  return moment(getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
}

const updatedAt = () => {
  return moment(getCurrentDate()).format("YYYY-MM-DD HH:mm:ss")
}

const runningQueueNumber = data => {
  const digit = get(data, ["digit"], 3) // จำนวนหลักเขคิว
  const last_number = get(data, ["last_number"], 0) // ตัวอักษรนำหน้าเลขคิว
  const prefix = get(data, ["prefix"], 0) // เลขคิวล่าสุด

  let next_number = 0

  const start_number = sprintf(`%'.0${digit}d`, 1)
  if (isEmpty(last_number)) {
    next_number = start_number
  } else if (/^\d+$/.test(last_number)) {
    let number = last_number.substring(prefix.length)
    number = parseInt(number) + 1
    next_number = `${prefix}${sprintf(`%'.0${digit}d`, number)}`
  } else if (typeof last_number === "string") {
    let number = last_number.substring(prefix.length)
    const number_length = number.length
    if (/^\d+$/.test(number)) {
      number = parseInt(number) + 1
      next_number = `${prefix}${sprintf(`%'.0${number_length}d`, number)}`
    } else {
      next_number = `${prefix}${sprintf(`%'.0${number_length}d`, 1)}`
    }
  } else {
    next_number = `${prefix}${sprintf(`%'.0${digit}d`, 1)}`
  }

  return next_number
}

const getAppointment = (appointment_ids = []) => {
  let appointment = "all"
  // ทั้งนัดและไม่นัด
  if (appointment_ids.includes("no") && appointment_ids.includes("yes")) {
    appointment = "all"
  }
  // ไม่นัด
  else if (appointment_ids.includes("no") && !appointment_ids.includes("yes")) {
    appointment = false
  }
  // นัดอย่างเดียว
  else if (!appointment_ids.includes("no") && appointment_ids.includes("yes")) {
    appointment = true
  }
  return appointment
}

module.exports = {
  loggerTimes,
  getCurrentDate,
  typeCast,
  getCurrentDateFormat,
  clock,
  createHeadersObj,
  updateObject,
  trimValue,
  mappingPaytype,
  sprintf,
  str_split,
  genRegNo,
  substrPayType,
  unserialize,
  getTimeRanges,
  startDateNow,
  endDateNow,
  getAppointStatus,
  randomString,
  createdAt,
  updatedAt,
  runningQueueNumber,
  getAppointment
}
