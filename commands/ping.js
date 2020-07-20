exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const fs = index.fs
  const Discord = index.Discord

  const timeFormatter = index.timeFormatter

  let uptime = timeFormatter.timeConvert({
    seconds: client.uptime / 1000,
    format: "letters"
  })

  let pingEmb = new Discord.RichEmbed()
    .setColor("#3333ee")
    .setTitle("Ping")
    .setDescription([
      `:arrows_clockwise: Latency: \`${Math.round(client.ping)} ms\``,
      `:clock530: Uptime: \`${uptime}\``
    ].join("\n"))
    
  message.channel.send(pingEmb)
}