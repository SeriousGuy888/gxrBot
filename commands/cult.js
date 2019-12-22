exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const config = index.config
  const Discord = index.Discord

  if(!args[0]) {
    let emb = new Discord.RichEmbed()
      .setColor("#aaaadd")
      .setTitle("Cult Feature Information")
      .addField("Channel", `<#${index.cultCache.id}>`)
      .addField("Word", index.cultCache.word)
    
    message.channel.send(emb)
  }
  else if(args[0]) {
    if(!config["admins"].includes(message.author.id)) return message.channel.send("You are not listed as a G8C admin! (If this is inaccurate, contact billzo)")
    message.channel.send("asbhd")
  }
}