exports.run = (client, message) => {
  const index = require("../index.js")
  const config = index.config
  const messenger = client.util.get("messenger")

  const notRepeat = channel => {
    channel.messages.fetch({ limit: 2 }).then(res => {
      const fetchedMessages = res.array()
      console.log(fetchedMessages[0].author.id != fetchedMessages[1].author.id)
      return fetchedMessages[0].author.id != fetchedMessages[1].author.id
    })
  }

  const legal = () => message.attachments.array().length === 0

  const cultLegal = (content, phrase) => {
    content = content.toLowerCase()
    phrase = phrase.toLowerCase()
    if(content == phrase) return legal() && true
  }
  const owsLegal = content => {
    content = content.toLowerCase().replace(/[^a-z ]/gi, "")
    if(content.split(" ").length != 1) return false
    return legal() && true
  }
  const deleteMessage = (msg, errorMessage) => {
    if(!msg.author.bot)
      messenger.dm(client, msg.author.id, errorMessage)
    msg.delete({ timeout: 500 })
  }

  if(message.author.id == client.user.id) return
  if(message.channel.id == config.coopchannels.cult.channel) {
    if(cultLegal(message.content, config.coopchannels.cult.phrase)) return
    deleteMessage(message, `Hey, so you seem to have misspelled \`${config.coopchannels.cult.phrase}\`. Don't worry, \`${message.content}\` is a very common misspelling (definitely).`)
  }
  else if(message.channel.id == config.coopchannels.ows.channel) {
    if(owsLegal(message.content)) return
    deleteMessage(message, `Your contribution to the one word story may only **be one word** and you **may not have attachments**.`)
  }
}