module.exports = async (client, message) => {
  const index = require("../index.js")
  const { config, schedule } = index
  const { badger, banker, logger } = client.util
  const { awaitOrders, updateKarma } = client.functions

  awaitOrders()
  logger.log(`${config.main.botNames.lowerCamelCase} successfully loaded ${process.env.DEV_MODE ? "in dev mode" : ""}`)

  client.user.setPresence({ status: "online" })
  client.user.setActivity(`antelope meat is called ant`, { type: "WATCHING" })
  
  
  schedule.scheduleJob("0 * * * *", () => {
    client.util.logger.uploadLogs("Hourly automatic log upload")
  })

  setInterval(() => {
    updateKarma()
    badger.updateBadges()
    banker.updateBalances()
    banker.updateInventories()
  }, 5 * 60 * 1000)

  setTimeout(async () => {
    index.propaganda(client)
  }, 1000)

  schedule.scheduleJob("*/15 * * * *", async () => {
    const channel = await client.channels.fetch("749728416827310181")
    channel.send("e")
  })
}