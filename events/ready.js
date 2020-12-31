module.exports = async (client, message) => {
  const index = require("../index.js")
  const { awaitOrders, config, schedule, updateKarma, logger, timer } = index

  awaitOrders()
  logger.log(`${config.main.botNames.lowerCamelCase} successfully loaded ${process.env.DEV_MODE ? "in dev mode" : ""}`)

  client.user.setPresence({ status: "online" })
  client.user.setActivity(`waiting for data...`, { type: "WATCHING" })


  const currentDate = new Date()
  const countdownDate = new Date("January 1 2021 00:00:00 GMT-0500") // new years eastern standard time
  const diffMillis = countdownDate - currentDate
  const timeRemaining = await timer.convert(diffMillis)

  setInterval(async () => {
    if(diffMillis > 0) {
      const pad = num => num.toString().padStart(2, "0")
      let { h, m, s } = timeRemaining
      client.user.setActivity(`${timeRemaining.d} days ${h}:${pad(m)}:${pad(s)} remaining...`, { type: "WATCHING" })
    }
    else {
      client.user.setActivity("🎆 Happy new year!", { type: "WATCHING" })
    }
  }, 7000)


  let newYearCountdownScheduleRule = new schedule.RecurrenceRule()
  newYearCountdownScheduleRule.tz = config.main.timezone.name
  
  // newYearCountdownScheduleRule.hour = 0
  newYearCountdownScheduleRule.minute = 0
  newYearCountdownScheduleRule.second = 0

  schedule.scheduleJob(newYearCountdownScheduleRule, () => {
    const newsChannel = client.channels.cache.get("749428233270853681")
    if(!newsChannel)
      return logger.log("Error - news channel does not exist D:")
    
    client.commands.get("new_year_countdown").fireWithoutUser(client, newsChannel)
  })

  

  schedule.scheduleJob("0 * * * *", () => {
    client.util.get("logger").uploadLogs("Hourly automatic log upload")
  })

  setInterval(() => {
    updateKarma()
  }, 5 * 60 * 1000)
}