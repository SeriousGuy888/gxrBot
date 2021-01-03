module.exports = async (client, message) => {
  const index = require("../index.js")
  const { awaitOrders, config, schedule, updateKarma, banker, logger, timer } = index

  awaitOrders()
  logger.log(`${config.main.botNames.lowerCamelCase} successfully loaded ${process.env.DEV_MODE ? "in dev mode" : ""}`)

  client.user.setPresence({ status: "online" })
  client.user.setActivity(`waiting for data...`, { type: "WATCHING" })

  setInterval(async () => {
    const currentDate = new Date()
    const countdownDate = new Date("January 1 2021 00:00:00 GMT-0500") // new years eastern standard time
    const diffMillis = countdownDate - currentDate
    const timeRemaining = await timer.convert(diffMillis)

    if(diffMillis > 0) {
      const pad = num => num.toString().padStart(2, "0")
      let { h, m, s } = timeRemaining
      client.user.setActivity(`${h}:${pad(m)}:${pad(s)} remaining...`, { type: "WATCHING" })
    }
    else {
      client.user.setActivity("🎆 Happy new year!", { type: "WATCHING" })
    }
  }, 7000)
  
  schedule.scheduleJob("0 * * * *", () => {
    client.util.logger.uploadLogs("Hourly automatic log upload")
  })

  setInterval(() => {
    updateKarma()
    banker.updateBalances()
  }, 5 * 60 * 1000)
}