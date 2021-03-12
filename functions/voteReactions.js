module.exports = async (reaction, user, removed) => {
  const index = require("../index.js")
  const { client, Discord, config } = index
  const { karmanator } = client.util
  const settings = config.karma

  let message = reaction.message
  
  const { logger } = client.util

  // reactions of bots and reactions of the message author do not count
  if(message.guild && message.guild.id !== config.main.guild.id)
    return
  if(user.bot || user.id === message.author.id)
    return
  if(message.webhookID || message.author.system) // webhook and system message authors cannot be added
    return


  let emoji

  if(reaction.emoji instanceof Discord.GuildEmoji) 
    emoji = reaction.emoji.id
  else
    emoji = reaction.emoji.name

  for(let i in settings.emojis) {
    if(settings.emojis[i].id === emoji) {
      if(settings.emojis[i].karma) {
        karmanator.add(message.author.id, removed ? -settings.emojis[i].karma : settings.emojis[i].karma, {
          reason: `${removed ? "remove" : "add"} ${i}`,
          voterId: user.id,
          messageId: message.id
        })
      }
      else {
        logger.log(`Karma vote reactions error: emoji ${i} does not have karma value!`)
      }
    }
  }
}