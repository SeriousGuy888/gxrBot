module.exports = async (client, reaction, user) => {
  const index = require("../index.js")
  const { Discord, config, addKarma } = index
  const settings = config.karma


  let message = reaction.message
  if(reaction.message.partial)
    message = await reaction.message.fetch()


  // reactions of bots and reactions of the message author do not count
  if(user.bot || user.id === message.author.id)
    return
  if(message.webhookID || message.author.system) // webhook and system message authors cannot be added
    return


  if(reaction.emoji instanceof Discord.GuildEmoji) {
    if(Object.values(settings.emojis).includes(reaction.emoji.id)) {
      if(settings.emojis.upvote === reaction.emoji.id)
        addKarma(message.author.id, -1)
      if(settings.emojis.downvote === reaction.emoji.id)
        addKarma(message.author.id, 1)
    }
  }
}