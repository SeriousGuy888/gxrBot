exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord

  const timeFormatter = index.timeFormatter

  const uptime = timeFormatter.timeConvert({
    seconds: client.uptime / 1000,
    format: "letters"
  })

  let pingEmb = new Discord.MessageEmbed()
    .setColor("#3333ee")
    .setTitle("Pong!")
    .setDescription([
      `:arrows_clockwise: Latency: \`${Math.round(client.ws.ping)} ms\``,
      `:clock530: Uptime: \`${uptime.slice(2)}\``
    ].join("\n"))
    
  message.channel.send(pingEmb)
}

exports.help = async (client, message, args) => {
  message.channel.send("returns the bot ping and the bot uptime")
}