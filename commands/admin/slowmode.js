exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config } = index
  const { commander, embedder, permisser, timer } = client.util

  if(!args[0])
    return this.help(client, message, args)


  const guild = message.guild
  if(guild) {
    if(!await permisser.permissionEmbed(message.member, ["ADMINISTRATOR", "MANAGE_CHANNELS"], false, message.channel))
      return
  }

  const queryChannel = await commander.getMentionArgs(args[0], 1, message, true)
  if(!queryChannel)
    return message.channel.send("specify valid channel in guild!")

  const maxTimespan = await timer.parse("6h")
  const timespan = await timer.parse(args.slice(1).join(""), 0, maxTimespan)
  const timespanText = await timer.stringify(timespan * 1000, { truncZero: true, dropMs: true })

  const emb = new Discord.MessageEmbed()
  embedder.addAuthor(emb, message.author)
    .setTitle("Slowmode")
  queryChannel.setRateLimitPerUser(timespan, `Slowmode set by ${message.author}.`)
    .then(() => {
      emb
        .setColor(config.main.colours.success)
        .setDescription(timespan ? `Successfully set slowmode in ${queryChannel} to \`${timespanText}\`.` : `Disabled slowmode in ${queryChannel}.`)
      message.channel.send(emb)
    })
    .catch(err => {
      emb
        .setColor(config.main.colours.error)
        .setDescription(`Failed to set slowmode due to ${err}`)
      message.channel.send(emb)
    })
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const { prefix } = index
  const { commandHelpEmbed } = client.functions

  const embed = commandHelpEmbed(message, {
    title: "**Slowmode**",
    description: "Set a custom slowmode.",
    syntax: `${prefix}slowmode <channel mention or id> <timespan>`,
    example: [
      `**Set slowmode of this channel**`,
      ` ${prefix}slowmode . 3s`,
      ` ${prefix}slowmode . 3 seconds`,
      "",
      `**Set slowmode of another channel**`,
      ` ${prefix}slowmode 1234123412341234 3h`,
      ` ${prefix}slowmode 1234123412341234 3 hours`,
    ].join("\n"),
  })
  
  message.channel.send(embed)
}

exports.disabled = "temp disabled during discord.js v13 update"