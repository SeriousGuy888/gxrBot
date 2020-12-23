exports.run = async (milliseconds) => {
  const index = require("../index.js")
  const { timer } = index

  console.trace(`Use of legacy timeConvert function. Should be converted to timer util.`)
  return timer.convert(milliseconds)
}