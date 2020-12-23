// const index = require("../index.js")

exports.convert = async milliseconds => {
  const unitRatios = {
    d: 1000 * 60 * 60 * 24,
    h: 1000 * 60 * 60,
    m: 1000 * 60,
    s: 1000
  }

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

exports.stringify = async (milliseconds, options) => {
  const time = await this.convert(milliseconds)
  
  let timeStr = ""
  for(const unit in time) {
    if(options) {
      if(options.truncZero) // if option to truncate zeroes 
        if(!timeStr && !time[unit]) // time string is empty and current time unit is 0
          continue // skip this time unit
      
      if(options.dropMs)
        if(unit === "ms")
          continue
    }
    timeStr += `${time[unit]}${unit}`
  }

  return timeStr
}