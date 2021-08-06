exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index

  let emb = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setTitle("Web Panel Link")
    .setDescription(`[Here](${config.main.links.web_panel})`)
  
  message.channel.send(emb)
}

exports.disabled = "temp disabled during discord.js v13 update"