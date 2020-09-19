const { config } = require("../index.js")

module.exports = (client, oldMessage, newMessage) => {
  switch(oldMessage.channel.id) {
    case config.coopchannels.cult.channel:
      if(newMessage.content.toLowerCase() == config.coopchannels.cult.phrase || oldMessage.author.id == client.user.id) return
      else newMessage.delete().then(() => {
        if(newMessage.author.bot) return
        
        newMessage.channel.send(`<@${newMessage.author.id}>, editing your message to say \`${newMessage.content}\` is a violation of the cult rules.\nYou may only say \`${config.coopchannels.cult.phrase}\` here.`).then(msg => {
          msg.delete(3000) // delete message in 3 seconds
        }).catch(err => {
          console.log(err)
        })
      })
      break
    case config.coopchannels.ows.channel:
      if(newMessage.content.split(" ").length == 1 || newMessage.author.id == client.user.id) {
        return
      }
  
      else newMessage.delete().then(() => {
        if(newMessage.author.bot) {
          return
        }
        
        newMessage.channel.send(`<@${message.author.id}>, this is the one word story channel. You are a stupid.`).then(msg => {
          msg.delete(3000) // delete message in 3 seconds
        }).catch(err => {})
      })
      break
    default:
      break
  }
}
