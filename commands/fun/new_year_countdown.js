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
      .setTitle(":hourglass: Countdown to 2021")
      .setDescription("00:00:00 EST on Monday, January 1st, 2021")
      .addField("Days", countdown.d, true)
      .addField("Hours", countdown.h, true)
      .addField("Minutes", countdown.m, true)
      .addField("Seconds", countdown.s, true)
      .addField("Milliseconds", countdown.ms, true)
      .setFooter("Can we get an uncursed year this time?")
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