exports.run = async (client, message, args) => {
  const index = require("../index.js")
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
    message.channel.send("test")
  }
}