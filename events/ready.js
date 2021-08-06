module.exports = async (client) => {
  const index = require("../index.js")
  const { config } = index
  const { logger } = client.util
  const { awaitOrders, deploySlashCommands, scheduleTasks } = client.functions

  awaitOrders()
  logger.log(`${config.main.botNames.lowerCamelCase} successfully loaded ${process.env.DEV_MODE ? "in dev mode" : ""}`)

  client.user.setPresence({ status: "online" })
  client.user.setActivity(`jascism moment!`, { type: "PLAYING" })
  
  deploySlashCommands(client)
  scheduleTasks(client)
}