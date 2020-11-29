exports.run = async (client, milliseconds) => {
  const unitRatios = {
    d: 1000 * 60 * 60 * 24,
    h: 1000 * 60 * 60,
    m: 1000 * 60,
    s: 1000
  }

  let ms = milliseconds
  
  let d = Math.floor(ms / unitRatios.d)
  ms -= d * unitRatios.d
  let h = Math.floor(ms / unitRatios.h)
  ms -= h * unitRatios.h
  let m = Math.floor(ms / unitRatios.m)
  ms -= m * unitRatios.m
  let s = Math.floor(ms / unitRatios.s)
  ms -= s * unitRatios.s

  return {
    d,
    h,
    m,
    s,
    ms
  }
}