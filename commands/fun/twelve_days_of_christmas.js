exports.run = async (client, message, args) => {
  this.fireWithoutUser(client, message.channel)
}

exports.fireWithoutUser = async (client, channel) => {
  const index = require("../../index.js")
  const Discord = index.Discord
  const timeConvert = index.timeConvert

  const currentDate = new Date()
  const countdownDate = new Date("December 25 2020 00:00:00 GMT-0500") // christmas eastern standard time
  const diffMillis = countdownDate - currentDate

  let emb = new Discord.MessageEmbed()

  if(diffMillis > 0) {
    const countdown = await timeConvert(diffMillis)
    emb
      .setColor("#629812")
      .setTitle(":christmas_tree: 12 Days of Christmas")
      .setDescription("Please remember to purchase\n\n" + [
        "🍐🍐 1 Partridge in a Pear Tree",
        "🐢🕊 2 Turtle Doves",
        "🇫🇷🐔 3 French Hens",
        "📢🐦 4 Calling Birds",
        "🟡⭕ 5 Golden Rings",
        "🦆 6 Geese-a-Laying",
        "🦢🌊 7 Swans-a-Swimming",
        "🐄 8 wait um maybe dont slavery",
        "💃 9 seriously dont do slavery",
        "🎩 10 why are we suddenly purchasing humans",
        "🥧 11 pipers doing whatever pipers do i guess",
        "🥁 12 drummers drumming or something"
      ].splice(0, 12 - countdown.d).join(",\n") + "\n\nfor your true love.")
  }
  else {
    emb
      .setColor("#df9e00")
      .setTitle("quakc")
      .setDescription("will exist again next year maybe")
  }

  channel.send(emb).then(msg => msg.react("🍐"))
}