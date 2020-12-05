module.exports = (client, oldMessage, newMessage) => {
  const index = require("../index.js")
  const { config, coopChannels } = index

  if(config.coopchannels.cult.channel == oldMessage.channel.id) {
    if(newMessage.content.toLowerCase() == config.coopchannels.cult.phrase || oldMessage.author.id == client.user.id)
      return
    newMessage.delete()
      .then(() => {
        if(newMessage.author.bot)
          return
        
        coopChannels.punish(newMessage, "cult", [
          config.coopchannels.cult.phrase,
          newMessage.content
        ])
      })
  }
  else if(config.coopchannels.ows.channel == oldMessage.channel.id) {
    if(newMessage.content.split(" ").length == 1 || newMessage.author.id == client.user.id)
      return
    newMessage.delete()
      .then(() => {
        if(newMessage.author.bot)
          return
        
        coopChannels.punish(newMessage, "ows")
      })
  }
}
