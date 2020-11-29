exports.run = async (client, milliseconds) => {
  let ms = milliseconds
  let h = Math.floor(ms / 1000 / 60 / 60)
  ms -= h * 1000 * 60 * 60
  let m = Math.floor(ms / 1000 / 60)
  ms -= m * 1000 * 60
  let s = Math.floor(ms / 1000)
  ms -= s * 1000

  return {
    h,
    m,
    s,
    ms
  }
}