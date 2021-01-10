module.exports = async (client, message) => {
  const index = require("../index.js")
  const { awaitOrders, config, schedule, updateKarma, banker, logger } = index

  awaitOrders()
  logger.log(`${config.main.botNames.lowerCamelCase} successfully loaded ${process.env.DEV_MODE ? "in dev mode" : ""}`)

  client.user.setPresence({ status: "online" })
  client.user.setActivity(`for ${config.main.prefix}help`, { type: "WATCHING" })
  
  
  schedule.scheduleJob("0 * * * *", () => {
    client.util.logger.uploadLogs("Hourly automatic log upload")
  })

  setInterval(() => {
    updateKarma()
    banker.updateBalances()
    banker.updateInventories()
  }, 5 * 60 * 1000)
}