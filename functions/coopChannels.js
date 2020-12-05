exports.run = (message) => {
  const index = require("../index.js")
  const { client, config } = index

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

  if(message.author.id == client.user.id) return
  if(message.channel.id == config.coopchannels.cult.channel) {
    if(cultLegal(message.content, config.coopchannels.cult.phrase)) return
    this.punish(message, "cult", [
      config.coopchannels.cult.phrase,
      message.content
    ])
  }
  else if(message.channel.id == config.coopchannels.ows.channel) {
    if(owsLegal(message.content)) return
    this.punish(message, "ows")
  }
}

exports.deleteMessage = (message, errorMessage) => {
  const index = require("../index.js")
  const { client } = index
  const messenger = client.util.get("messenger")

  if(!message.author.bot)
    messenger.dm(message.author.id, errorMessage)
  message.delete({ timeout: 500 })
}

exports.punish = (message, mode, placeholders) => {
  if(!message || !mode)
    throw Error("Specify message and mode to penalize.")
  
  let scoldingMessage = "co-op error0"
  switch(mode) {
    case "cult":
      if(!placeholders) {
        scoldingMessage = "co-op error1"
        break
      }
      scoldingMessage = `Hey, so you seem to have misspelt \`${placeholders[0]}\`. Don't worry, \`${placeholders[1]}\` is a very common misspelling (definitely). I've gone ahead and nuked your message. Try to be a better ~~cult~~ league member next time.`
      break
    case "ows":
      scoldingMessage = `Your contribution to the one word story may only **be one word** and you **may not have attachments**.`
      break
    default:
      scoldingMessage = "co-op error2"
      break
  }
  
  this.deleteMessage(message, scoldingMessage)
}