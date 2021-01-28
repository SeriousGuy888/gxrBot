exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { messenger, embedder, guildPreferencer, permisser } = client.util


  const guild = message.guild
  if(!guild) {
    message.channel.send("This command must be executed in a discord server!")
    return
  }

  const authorMember = await guild.members.fetch(message.author)

  if(!(permisser.hasPermission(authorMember, "ADMINISTRATOR") || permisser.hasPermission(authorMember, "MANAGE_GUILD"))) {
    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.error)
      .setTitle("Insufficient Permissions")
      .setDescription("You may not use this command as you do not have the permission `ADMINISTRATOR` or `MANAGE_GUILD`.")
      .setFooter("Is this a mistake? Contact server admins.")
    embedder.addAuthor(emb, message.author)
    message.channel.send(emb)
    return
  }


  const prefEmbed = async () => {
    const emb = new Discord.MessageEmbed()
      .setColor(config.main.colours.success)
      .setTitle(`:gear: \`${guild.name}\` Guild Settings`)
      .setDescription("Use `-guild_settings <setting> <value>` to change a setting.")

    const preferences = await guildPreferencer.get(guild.id)
    for(const i in preferences) {
      emb.addField(i.toUpperCase(), typeof preferences[i] === "boolean" ? `\`[BOOL]\` ${preferences[i].toString().toUpperCase()}` : preferences[i], true)
    }

    return emb
  }


  if(!args[0]) {
    const msg = await messenger.loadingMessage(message.channel, {
      colour: config.main.colours.help,
      title: `Getting guild settings...`
    })

    const emb = await prefEmbed()

    msg.edit(emb)
    return
  }

  const prefName = args[0]?.toLowerCase()
  let prefValue = args[1] ?? null

  switch(prefValue.toLowerCase()) {
    case "true":
      prefValue = true
      break
    case "false":
      prefValue = false
      break
    case "null":
      prefValue = null
      break
  }

  if(!guildPreferencer.isValid(prefName)) {
    message.channel.send("Invalid preference name!")
    return
  }
  if(prefValue === null) {
    message.channel.send("Specify `true`, `false`, or `null`. Anything else will be interpreted as a string.")
    return
  }

  await guildPreferencer.set(guild.id, prefName, prefValue)
  const responseEmbed = await prefEmbed()
  message.channel.send(responseEmbed)
}