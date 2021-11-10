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
  const { birthdays } = config
  
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

  schedule.scheduleJob("0 0 * * *", () => {
    const emb = new Discord.MessageEmbed()
      .setColor("#c32323")
      .setTitle("fakt pls")
      .setDescription("<#735708848333258822>")
    messenger.dm("636530890826055691", { content: "fakt pls", embeds: [emb] })
  })

  schedule.scheduleJob("0 0 * * *", () => {
    const tzOffset = -5 // eastern standard time
    const date = new Date(new Date().getTime() + tzOffset * 3600 * 1000)
    const month = date.getMonth() + 1
    const day = date.getDate()
    
    const todaysBirthdays = []
    for(const name in birthdays) {
      if(birthdays[name] === `${month}-${day}`) {
        todaysBirthdays.push(name)
      }
    }

    if(todaysBirthdays.length === 0)
      return

    const emb = new Discord.MessageEmbed()
      .setColor("FUCHSIA")
      .setTitle(":cake: Birthdays Today! [test send with timezone fixed]")
      .setDescription(`Here are the birthdays I have on my list today!\n\`\`\`${todaysBirthdays.join(", ")}\`\`\``)
      .setFooter("Birthdays for " + date.toISOString().split("T")[0])

    messenger.dm("192833577883402240", { embeds: [emb] })
    messenger.dm("323170410818437130", { embeds: [emb] })
  })
}