module.exports = (client) => {
  const index = require("../index.js")
  const { config, Discord, schedule } = index
  const {
    badger,
    banker,
    karmanator,
    messenger,
    preferencer,
    guildPreferencer,
    statTracker
  } = client.util
  
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

  setTimeout(async () => index.propaganda(client), 1000)

  schedule.scheduleJob("0 */6 * * *", () => {
    const emb = new Discord.MessageEmbed()
      .setColor("#c32323")
      .setTitle("fact pls")
      .setDescription("<#735708848333258822>")
    messenger.dm("414938441546203136", emb)
  })
}