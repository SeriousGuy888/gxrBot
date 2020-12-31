exports.run = async (client, message, args) => {
  this.fireWithoutUser(client, message.channel)
}

exports.fireWithoutUser = async (client, channel) => {
  const index = require("../../index.js")
  const { Discord, timer } = index

  const currentDate = new Date()
  const countdownDate = new Date("January 1 2021 00:00:00 GMT-0500") // new years eastern standard time
  const diffMillis = countdownDate - currentDate

  let emb = new Discord.MessageEmbed()

  if(diffMillis > 0) {
    const countdown = await timer.convert(diffMillis)
    emb
      .setColor("#12d812")
      .setTitle(":hourglass: Hourly Countdown to 2021")
      .setDescription("00:00:00 EST on Monday, January 1st, 2021")
      .setFooter("Can we get an uncursed year this time?")
    
    for(const i in countdown) {
      let unit
      switch(i) {
        case "d":
          unit = "Days"
          break
        case "h":
          unit = "Hours"
          break
        case "m":
          unit = "Minutes"
          break
        case "s":
          unit = "Seconds"
          break
        case "ms":
          unit = "Milliseconds"
          break
      }
      if(countdown[i])
        emb.addField(unit, countdown[i], true)
    }
  }
  else {
    emb
      .setColor("#df9e00")
      .setTitle(":tada: Happy New Year")
      .setDescription("2020 has finally ended :D")
      .setFooter("Could this year be uncursed please?")
  }

  channel.send(emb).then(msg => msg.react("🎉"))
}