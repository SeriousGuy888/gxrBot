exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord

  const timeFormatter = index.timeFormatter

  const uptime = timeFormatter.timeConvert({
    seconds: client.uptime / 1000,
    format: "letters"
  })

  let pingEmb = new Discord.RichEmbed()
    .setColor("#3333ee")
    .setTitle("Pong!")
    .setDescription([
      `:arrows_clockwise: Latency: \`${Math.round(client.ping)} ms\``,
      `:clock530: Uptime: \`${uptime.slice(2)}\``
    ].join("\n"))
    
  message.channel.send(pingEmb)
}