module.exports = (client, message) => {
  const index = require("../index.js")
  const { config, schedule, updateKarma, logger, timer } = index
  const awaitOrders = client.functions.get("awaitOrders").run

  awaitOrders()
  logger.log(`${config.main.botNames.lowerCamelCase} successfully loaded ${process.env.DEV_MODE ? "in dev mode" : ""}`)

  client.user.setPresence({ status: "online" })
  client.user.setActivity(`waiting for data...`, { type: "WATCHING" })

  setInterval(async () => {
    const currentDate = new Date()
    const countdownDate = new Date("January 1 2021 00:00:00 GMT-0500") // new years eastern standard time
    const diffMillis = countdownDate - currentDate

    if(diffMillis > 0) {
      const res = await timer.convert(diffMillis)
      const pad = num => num.toString().padStart(2, "0")
      let { h, m, s } = res
      client.user.setActivity(`${res.d} days ${h}:${pad(m)}:${pad(s)} remaining...`, { type: "WATCHING" })
    }
    else {
      client.user.setActivity("🎆 Happy new year!", { type: "WATCHING" })
    }
  }, 7000)


  schedule.scheduleJob("0 * * * *", () => {
    client.util.get("logger").uploadLogs("Hourly automatic log upload")
  })



  let newYearCountdownScheduleRule = new schedule.RecurrenceRule()

  newYearCountdownScheduleRule.tz = config.main.timezone.name
  newYearCountdownScheduleRule.second = 0
  newYearCountdownScheduleRule.minute = 0
  newYearCountdownScheduleRule.hour = 0
  schedule.scheduleJob(newYearCountdownScheduleRule, () => {
    const newsChannel = client.channels.cache.get("749428233270853681")
    if(!newsChannel)
      return logger.log("Error - news channel does not exist D:")
    
    client.commands.get("new_year_countdown").fireWithoutUser(client, newsChannel)
  })

  let twelveChristmasScheduleRule = new schedule.RecurrenceRule()
  twelveChristmasScheduleRule.tz = config.main.timezone.name
  twelveChristmasScheduleRule.second = 0
  twelveChristmasScheduleRule.minute = 0
  twelveChristmasScheduleRule.hour = 12
  schedule.scheduleJob(twelveChristmasScheduleRule, () => {
    const newsChannel = client.channels.cache.get("749428233270853681")
    if(!newsChannel)
      return logger.log("Error - news channel does not exist D:")
    
    client.commands.get("twelve_days_of_christmas").fireWithoutUser(client, newsChannel)
  })


  setInterval(() => {
    updateKarma()
  }, 5 * 60 * 1000)
}