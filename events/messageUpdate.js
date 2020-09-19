const { config } = require("../index.js")

module.exports = (client, oldMessage, newMessage) => {
  if(config.coopchannels.cult.channel == oldMessage.channel.id) {
    if(newMessage.content.toLowerCase() == config.coopchannels.cult.phrase || oldMessage.author.id == client.user.id) return
    newMessage.delete().then(() => {
      if(newMessage.author.bot) return
      
      newMessage.channel.send(`<@${newMessage.author.id}>, editing your message to say \`${newMessage.content}\` is a violation of the cult rules.\nYou may only say \`${config.coopchannels.cult.phrase}\` here.`)
        .then(msg => msg.delete(3000))
        .catch(console.error)
    })
  }
  else if(config.coopchannels.ows.channel == oldMessage.channel.id) {
    if(newMessage.content.split(" ").length == 1 || newMessage.author.id == client.user.id) return
    newMessage.delete().then(() => {
      if(newMessage.author.bot) return
      
      newMessage.channel.send(`<@${message.author.id}>, this is the one word story channel. You are a stupid.`)
        .then(msg => msg.delete(3000))
        .catch(console.error)
    })
  }
}
