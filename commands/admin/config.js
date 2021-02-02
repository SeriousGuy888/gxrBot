exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { messenger, guildPreferencer, permisser } = client.util


  const guild = message.guild
  if(!guild) {
    message.channel.send("This command must be executed in a discord server!")
    return
  }

  if(!await permisser.permissionEmbed(message.member, ["ADMINISTRATOR", "MANAGE_GUILD"], false, message.channel))
    return

  let maxPages

  const prefEmbed = async (page) => {
    const preferences = await guildPreferencer.get(guild.id)

    const keys = Object.keys(preferences)
    const itemsPerPage = 9
    const startAt = (page - 1) * itemsPerPage
    const endAt = startAt + itemsPerPage
    maxPages = Math.ceil(keys.length / itemsPerPage)


    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.success)
      .setTitle(`:gear: \`${guild.name}\` Guild Settings`)
      .setDescription(`Use \`${config.main.prefix}config <setting> <value>\` to change a setting.\nYou can leave out the value field to set the setting to \`null\`.`)
      .setFooter(`Page ${page} of ${maxPages}`)


    for(var i = startAt; i < endAt; i++) {
      const key = keys[i]
      if(!key)
        break

      const fieldType = `\`[${preferences[key] === null ? "null" : typeof preferences[key]}]\``
      const fieldTitle = `${guildPreferencer.default()[key].emoji ? guildPreferencer.default()[key].emoji + " " : ""}${key.toUpperCase()}`
      emb.addField(fieldTitle, `${fieldType} ${preferences[key]}`, true)
    }

    return emb
  }


  if(!args[0]) {
    const msg = await messenger.loadingMessage(message.channel, {
      colour: config.main.colours.help,
      title: `Getting guild settings...`
    })

    let page = 1

    const emojis = ["⏪", "◀️", "▶️", "⏩"]
    const emb = await prefEmbed(page)

    await msg.edit(emb)
    const filter = (reaction, reactor) => (emojis.includes(reaction.emoji.name)) && (reactor.id === message.author.id)
    msg.createReactionCollector(filter, { time: 30000 })
      .on("collect", async (reaction, reactor) => {
        reaction.users.remove(reactor)
        switch(reaction.emoji.name) {
          case "⏪":
            page = 1
            break
          case "◀️":
            page--
            break
          case "▶️":
            page++
            break
          case "⏩":
            page = maxPages
            break
        }
        page = Math.max(Math.min(maxPages, page), 1)

        const newEmb = await prefEmbed(page)
        msg.edit(newEmb)
      })
      .on("exit", collected => {
        msg.edit("No longer collecting reactions.")
      })
    for(const emoji of emojis)
      await msg.react(emoji)

    
    return
  }

  const prefName = args[0]?.toLowerCase()
  let prefValue = args.slice(1).join(" ")


  if(!guildPreferencer.isValid(prefName)) {
    message.channel.send("Invalid preference name!")
    return
  }
  
  const status = await guildPreferencer.set(guild.id, prefName, prefValue)
  message.channel.send(status)
}