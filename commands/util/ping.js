exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const prefix = index.prefix
  const Discord = index.Discord

  const uptime = await index.timeConvert(client.uptime)
  let uptimeStr = ""
  for(let i in uptime)
    uptimeStr += `${uptime[i]}${i}`

  // gets the name of the command used
  const cmdName = message.content.slice(prefix.length).trim().split(/ +/g).shift().toLowerCase().trim().slice(0, config.main.maxCommandNameLength)


  let pingEmb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setTitle(cmdName.toLowerCase() == "pong" ? "Ping!" : "Pong!") // will say ping if the command alias pong was used
    .setDescription([
      `:arrows_clockwise: Latency: \`${Math.round(client.ws.ping)} ms\``,
      `:clock530: Uptime: \`${uptimeStr}\``
    ].join("\n"))
    
  message.channel.send(pingEmb)
}

exports.help = async (client, message, args) => {
  message.channel.send("returns the bot ping and the bot uptime")
}