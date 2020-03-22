"use strict"

function Foo(options) {
  this.options = options
}

Foo.prototype.getData = async () => {
  console.log("getData")
}

Foo.prototype.getData = async () => {
  console.log("getData")
}

module.exports = Foo
