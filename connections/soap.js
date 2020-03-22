"use strict"
const soap = require("soap")

module.exports = options => {
  const url = options.url
  if (typeof url !== "string") return new Error("options.url should be a string")
  return soap.createClientAsync(url, options.options)
}
