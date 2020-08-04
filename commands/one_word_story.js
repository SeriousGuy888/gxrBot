exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const config = index.config
  const Discord = index.Discord

  const db = index.db

  let doc = db.collection("channels").doc("one_word_story")
  
  if(!args[0]) {
    let emb = new Discord.RichEmbed()
      .setColor("#aaaadd")
      .setTitle("Cult Feature Information")
      .addField("Channel", `${index.owsCache.id}`)
    
    message.channel.send(emb)
  }
  else if(args[0]) {
    if(!config.admin.ids[message.author.id]) return message.channel.send("You are not listed as an admin! (If this is inaccurate, contact billzo (contact billzo da magic programmer and not billzo da magic caterpillar))")
    
    switch(args[0]) {
      case "set":
        if(!args[1]) return message.channel.send("Syntax: `c!one_word_story set channel <channel mention>`")
        if(args[1] == "channel") {
            if(!args[2]) return message.channel.send("Syntax: `c!one_word_story set channel <channel mention>`")

            doc.set({id: args[2]}, {merge: true}).then(() => {
              message.channel.send("Channel set!")
            })

            break
        }
        else {
          message.channel.send("Invalid arguments!")
        }
      default:
        message.channel.send("Invalid arguments!")
        break
    }
  }
}