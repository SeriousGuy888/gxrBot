exports.run = async (client, reaction, user, removed) => {
  const index = require("../index.js")
  const { Discord, config, addKarma } = index
  const settings = config.karma

  let message = reaction.message

  // reactions of bots and reactions of the message author do not count
  if(user.bot || user.id === message.author.id)
    return
  if(message.webhookID || message.author.system) // webhook and system message authors cannot be added
    return


  if(reaction.emoji instanceof Discord.GuildEmoji) {
    for(let i in settings.emojis) {
      if(settings.emojis[i].id === reaction.emoji.id)
        if(settings.emojis[i].karma)
          addKarma(message.author.id, removed ? -settings.emojis[i].karma : settings.emojis[i].karma, {
            reason: i,
            voterId: user.id,
            messageId: message.id
          })
        else
          console.log(`Karma vote reactions error: emoji ${i} does not have karma value!`)
    }
  }
}