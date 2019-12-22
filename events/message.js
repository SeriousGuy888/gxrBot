module.exports = (client, message) => {
  const index = require("../index.js")
  const config = index.config
  const prefix = index.prefix

  const db = index.db
  let cultCache = index.cultCache
  let cultChannelId = cultCache.id.slice(2, cultCache.id.length - 1) // remove <# and > from channel mention to get id

  if(message.author.bot) return //ignore bots

  let args
  let command
  let cmd

  if(message.content.toLowerCase().indexOf(prefix) === 0) {
    args = message.content.slice(prefix.length).trim().split(/ +/g)
    command = args.shift().toLowerCase().trim()

    cmd = client.commands.get(command) //grab cmds from enmap

    if(!cmd) return message.channel.send(`\`ERROR\`: Command \`${prefix}${command}\` not found.`)
    cmd.run(client, message, args)
  }

  if(message.channel.id === cultChannelId) {
    message.channel.send("cult")
  }
}
