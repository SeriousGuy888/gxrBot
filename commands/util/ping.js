exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const prefix = index.prefix
  const Discord = index.Discord
  const timeConvert = index.timeConvert

  const uptime = await timeConvert(client.uptime)
  let uptimeStr = ""
  for(let i in uptime)
    uptimeStr += `${uptime[i]}${i}`
  
  const age = await timeConvert(new Date() - client.user.createdAt)
  let ageYears = (age.d / 365).toFixed(2)

  // gets the name of the command used
  const cmdName = message.content.slice(prefix.length).trim().split(/ +/g).shift().toLowerCase().trim().slice(0, config.main.maxCommandNameLength)


  let pingEmb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setTitle(cmdName.toLowerCase() == "pong" ? "Ping!" : "Pong!") // will say ping if the command alias pong was used
    .addField(":clock530: Uptime", `\`${uptimeStr}\``)
    .addField(":arrows_clockwise: Latency", `\`${Math.round(client.ws.ping)} ms\``)
    .addField(":cake: Age", `I'm \`${ageYears}\` ${ageYears == 1 ? "year" : "years"} old!\n(${client.user.createdAt.toUTCString()})`)

  if(process.env.DEV_MODE)
    pingEmb.addField(":keyboard: Dev Mode", `\`${process.env.DEV_MODE}\``)
    
  message.channel.send(pingEmb)
}

exports.help = async (client, message, args) => {
  message.channel.send("returns the bot ping and the bot uptime")
}