module.exports = async (client, message) => {
  const index = require("../index.js")
  const { config, Discord, schedule } = index
  const {
    badger,
    banker,
    karmanator,
    logger,
    messenger,
    minecraftPinger,
    poller,
    preferencer,
    guildPreferencer,
    statTracker
  } = client.util
  const { awaitOrders } = client.functions

  awaitOrders()
  poller.closeOldPolls()
  logger.log(`${config.main.botNames.lowerCamelCase} successfully loaded ${process.env.DEV_MODE ? "in dev mode" : ""}`)

  client.user.setPresence({ status: "online" })
  client.user.setActivity(`affection uncrat beas!`, { type: "PLAYING" })
  
  
  schedule.scheduleJob("0 * * * *", () => {
    client.util.logger.uploadLogs("Hourly automatic log upload")
  })

  setInterval(() => {
    karmanator.update()
    statTracker.update()
    preferencer.update()
    guildPreferencer.update()
    badger.updateBadges()
    banker.updateBalances()
    banker.updateInventories()
  }, 5 * 60 * 1000)

  setInterval(() => {
    minecraftPinger.update()
  }, 30 * 60 * 1000)

  setTimeout(async () => {
    index.propaganda(client)
  }, 1000)

  // schedule.scheduleJob("*/15 * * * *", async () => {
  //   const channel = await client.channels.fetch("749728416827310181")
  //   channel.send("e")
  // })

  schedule.scheduleJob("*/5 * * * *", async () => {
    minecraftPinger.recordMinehut("cheezsurv4", "cheezsurv4")
  })

  schedule.scheduleJob("0 0 * * *", () => {
    const emb = new Discord.MessageEmbed()
      .setColor("#23a1b1")
      .setTitle("<:microsoft:829801007764471808> This is Microsoft")
      .setDescription("Feed me moolah immediately or your :computer: will be :bricks:ed.")
    messenger.dm("427925505581383721", emb) // liaosmdk
    messenger.dm("393590581000929281", emb) // jajspoder
  })

  schedule.scheduleJob("0 */6 * * *", () => {
    const emb = new Discord.MessageEmbed()
      .setColor("#c32323")
      .setTitle("fact pls")
      .setDescription("<#735708848333258822>")
      .setImage(process.env.BLACKMAIL)
    messenger.dm("414938441546203136", emb)
  })
}