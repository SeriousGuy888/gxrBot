module.exports = async (client) => {
  const index = require("../index.js")
  const { config } = index
  const { logger } = client.util
  const { awaitOrders, scheduleTasks } = client.functions

  awaitOrders()
  logger.log(`${config.main.botNames.lowerCamelCase} successfully loaded ${process.env.DEV_MODE ? "in dev mode" : ""}`)

  client.user.setPresence({ status: "online" })
  client.user.setActivity(`Jasper for vcdeAict8ricr!`, { type: "PLAYING" })
  
  scheduleTasks(client)
}