// const index = require("../index.js")

const unitRatios = {
  y: 1000 * 60 * 60 * 24 * 365,
  w: 1000 * 60 * 60 * 24 * 7,
  d: 1000 * 60 * 60 * 24,
  h: 1000 * 60 * 60,
  m: 1000 * 60,
  s: 1000
}

exports.convert = async milliseconds => {
  let ms = milliseconds
  let d, h, m, s = 0

  d = Math.floor(ms / unitRatios.d)
  ms -= d * unitRatios.d

  h = Math.floor(ms / unitRatios.h)
  ms -= h * unitRatios.h

  m = Math.floor(ms / unitRatios.m)
  ms -= m * unitRatios.m
  
  s = Math.floor(ms / unitRatios.s)
  ms -= s * unitRatios.s

  return {
    d,
    h,
    m,
    s,
    ms
  }
}

exports.parse = async (str, min, max) => {
  if(!min) min = -Infinity
  if(!max) max = Infinity

  const timeString = str.toLowerCase()
  const pattern = /(\d+)(y|w|d|h|m|s)/g

  let timespan = 0
  let match

  while(match = pattern.exec(timeString)) {
    const magnitude = parseInt(match[1]) // how many hours
    const unit = match[2] // hours
    const ratio = unitRatios[unit]
      
    timespan += (magnitude * ratio)
  }

  return Math.max(Math.min((timespan / unitRatios.s), max), min) // return timespan in seconds
}

exports.stringify = async (milliseconds, options) => {
  const time = await this.convert(milliseconds)
  
  let timeStr = ""
  for(const unit in time) {
    if(options) {
      if(
        options.truncZero && // if option to truncate zeroes 
        !timeStr && !time[unit] // time string is empty and current time unit is 0
      )
        continue // skip this time unit
      
      if(
        options.dropMs && // option to drop milliseconds
        unit === "ms" && // current unit is milliseconds
        timeStr // current string is not empty
      )
        continue // skip
    }
    timeStr += `${time[unit]}${unit}`
  }

  return timeStr
}