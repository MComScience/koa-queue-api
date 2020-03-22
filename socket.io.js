"use strict"

const { clock } = require("./utils")
const { socketEvents } = require("./configs")
const events = socketEvents

module.exports = io => {
  io.origins((origin, callback) => {
    if (!["*", "http://yii2-queue-udon.local", "http://172.16.254.64"].includes(origin)) {
      return callback("origin not allowed", false)
    }
    callback(null, true)
  })

  let initClock = false
  /* socket events */
  io.on("connection", function(socket) {
    /* ลงทะเบียนคิว */
    socket.on(events.REGISTER_QUEUE, data => {
      socket.broadcast.emit(events.REGISTER_QUEUE, data)
    })
    /* เสียบบัตร */
    socket.on(events.CARD_INSERTED, data => {
      socket.broadcast.emit(events.CARD_INSERTED, data)
    })
    /* ถอดบัตร */
    socket.on(events.CARD_REMOVED, data => {
      socket.broadcast.emit(events.CARD_REMOVED, data)
    })
    /* อ่านบัตร */
    socket.on(events.READING_START, data => {
      socket.broadcast.emit(events.READING_START, data)
    })
    /* อ่านบัตรสำเร็จ */
    socket.on(events.READING_COMPLETE, data => {
      socket.broadcast.emit(events.READING_COMPLETE, data)
    })
    /* อ่านบัตรไม่สำเร็จ */
    socket.on(events.READING_FAIL, data => {
      socket.broadcast.emit(events.READING_FAIL, data)
    })
    /* ถอดบัตร */
    socket.on(events.DEVICE_DISCONNECTED, data => {
      socket.broadcast.emit(events.DEVICE_DISCONNECTED, data)
    })
    /* อัพเดทคิว */
    socket.on(events.UPDATE_QUEUE, data => {
      io.emit(events.UPDATE_QUEUE, data)
    })
    /* ลบคิว */
    socket.on(events.DELETE_QUEUE, data => {
      io.emit(events.DELETE_QUEUE, data)
    })
    /* เรียกคิว */
    socket.on(events.ON_CALL_WAIT, data => {
      socket.broadcast.emit(events.ON_CALL_WAIT, data)
    })
    /* เสร็จสิ้นคิว */
    socket.on(events.ON_END_WAIT, data => {
      socket.broadcast.emit(events.ON_END_WAIT, data)
    })
    /* เรียกคิว */
    socket.on(events.ON_RECALL, data => {
      socket.broadcast.emit(events.ON_RECALL, data)
    })
    /* พักคิว */
    socket.on(events.ON_HOLD, data => {
      socket.broadcast.emit(events.ON_HOLD, data)
    })
    /* เสร็จสิ้นคิว */
    socket.on(events.ON_END, data => {
      socket.broadcast.emit(events.ON_END, data)
    })
    /* เล่นเสียง */
    socket.on(events.AUDIO_PLAYING, data => {
      socket.broadcast.emit(events.AUDIO_PLAYING, data)
    })
    /* เล่นเสียงเสร็จ */
    socket.on(events.AUDIO_ENDED, data => {
      socket.broadcast.emit(events.AUDIO_ENDED, data)
    })
    /* ตั้งค่า */
    socket.on(events.SETTINGS, data => {
      socket.broadcast.emit(events.SETTINGS, data)
    })
    /* ใบสั่งยามีปัญหา */
    socket.on(events.ON_PROBLEM_PRESCRIPTION, data => {
      socket.broadcast.emit(events.ON_PROBLEM_PRESCRIPTION, data)
    })
    /* พิมพ์บัตรคิว */
    socket.on(events.PRINTING_QUEUE, data => {
      socket.broadcast.emit(events.PRINTING_QUEUE, data)
    })
    /* พิมพ์บัตรคิว error */
    socket.on(events.PRINTING_ERROR, data => {
      socket.broadcast.emit(events.PRINTING_ERROR, data)
    })

    if (!initClock) {
      initClock = true
      clock(socket, events)
    }

    socket.on("disconnect", () => {
      io.emit("user disconnected")
    })
  })
}
