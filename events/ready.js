module.exports = (client, message) => {
  const index = require("../index.js")
  const schedule = index.schedule

  console.log("g9lBot Loaded!")

  client.user.setPresence({ status: "online" })
  client.user.setActivity(`waiting for data...`, { type: "WATCHING" })

  setInterval(async () => {
    const currentDate = new Date()
    const countdownDate = new Date("January 1 2021 00:00:00 GMT-0500") // new years eastern standard time
    const diffMillis = countdownDate - currentDate
    const res = await index.timeConvert(diffMillis)

    let { h, m, s } = res
    const pad = num => num.toString().padStart(2, "0")

    client.user.setActivity(`${res.d} days ${h}:${pad(m)}:${pad(s)} remaining...`, { type: "WATCHING" })
  }, 10 * 1000)

  schedule.scheduleJob("0 0 0 * * *", () => {
    const newsChannel = client.channels.cache.get("749428233270853681")
    if(!newsChannel)
      return console.log("Error - news channel does not exist D:")
    
    client.commands.get("2021").fireWithoutUser(client, newsChannel)
  })

  setInterval(() => {
    index.propaganda()
  }, 5 * 60 * 1000)
}