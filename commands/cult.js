exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const config = index.config
  const Discord = index.Discord

  const db = index.db

  let doc = db.collection("channels").doc("cult")
  
  if(!args[0]) {
    let emb = new Discord.MessageEmbed()
      .setColor("#aaaadd")
      .setTitle("Cult Feature Information")
      .addField("Channel", `${index.cultCache.id}`)
      .addField("Word", index.cultCache.word)
    
    message.channel.send(emb)
  }
  else if(args[0]) {
    if(!config.admin.ids[message.author.id]) return message.channel.send("You are not listed as an admin! (If this is inaccurate, contact billzo (contact billzo da magic programmer and not billzo da magic caterpillar))")
    
    if(args[0] === "set") {
      if(!args[1]) return message.channel.send("Syntax: `c!cult set <channel | phrase> <params>`")
      switch(args[1]) {
        case "channel":
          if(!args[2]) return message.channel.send("Syntax: `c!cult set channel <channel mention>`")

          doc.set({id: args[2]}, {merge: true}).then(() => {
            message.channel.send("Channel set!")
          })

          break
        case "phrase":
          if(!args[2]) return message.channel.send("Syntax: `c!cult set phrase <words>`")

          doc.set({word: args.slice(2).join(" ")}, {merge: true}).then(() => {
            message.channel.send("Phrase set!")
          })

          break
        default:
          message.channel.send("Invalid arguments!")
          break
      }
    }
    else {
      message.channel.send("Invalid arguments!")
    }
  }
}