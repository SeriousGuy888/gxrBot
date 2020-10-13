module.exports = (client, message) => {
  const index = require("../index.js")
  const config = index.config
  const prefix = index.prefix
  
  const messenger = client.util.get("messenger")

  let pauseAutocarrotCache = index.pauseAutocarrotCache

  let args
  let command
  let cmd


  if(message.content.toLowerCase().indexOf(prefix) === 0) {
    if(message.author.bot) return //ignore bots

    args = message.content.slice(prefix.length).trim().split(/ +/g)
    command = args.shift().toLowerCase().trim().slice(0, config.main.maxCommandNameLength)

    cmd = client.commands.get(command) //grab cmds from enmap

    
    if(cmd && cmd.alias) cmd = client.commands.get(cmd.alias)
    if(!cmd) return message.channel.send(`The command \`${command}\` (or the command it points to) does not exist.`)

    if(config.main.help.flags.includes(args[0]) && cmd.help) cmd.help(client, message, args)
    else {
      if(!cmd.run)
        message.channel.send(`The command you requested or the command it points to does not have a defined \`run\` function.`)
      else cmd.run(client, message, args)
    }
  }
  
  else if(index.gameCache.hangman[message.author.id]) {
    cmd = client.commands.get("hangman")
    args = ["guess"].concat(message.content.split(" "))
    cmd.run(client, message, args)
  }


  if(config.autocarrot.settings.enabled) {
    if(message.content.toLowerCase().includes(config.autocarrot.settings.pause.message)) {
      pauseAutocarrotCache[message.author.id] = {
        issued: new Date()
      }

      message.channel.send(`Okay, I will stop autocarroting you for the next ${config.autocarrot.settings.pause.timespan} seconds.`)
      return
    }

    if(message.author.id == client.user.id) return
    if(config.autocarrot.settings.exempt.bots && message.author.bot) return
    if(config.autocarrot.settings.exempt.webhooks && message.webhookID) return
    if(config.autocarrot.settings.exempt.userList.includes(message.author.id)) return
    if(pauseAutocarrotCache[message.author.id] && config.autocarrot.settings.pause.timespan >= (new Date().getTime() - pauseAutocarrotCache[message.author.id].issued.getTime()) / 1000) return

    const autocarrotWebhook = index.autocarrotWebhook
    const swearCensors = config.autocarrot.words
    const swearList = Object.keys(swearCensors)

    let needsCorrecting = false
    for(let i in swearList) {
      if(message.content.toLowerCase().includes(swearList[i])) {
        needsCorrecting = true
      }
    }

    if(needsCorrecting) {
      autocarrotWebhook(message.author, message.channel, message.content)
      if(config.autocarrot.settings.deleteOriginalMessage) {
        message.delete()
      }
    }
  }


  if([config.coopchannels.cult.channel, config.coopchannels.ows.channel].includes(message.channel.id)) index.coopChannels(message)
  
  if(config.autoResponses.settings.enabled) index.autoResponses(message)
  index.pog(message)
}