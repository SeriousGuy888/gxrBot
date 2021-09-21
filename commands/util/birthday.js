exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { embedder } = client.util

  if(!message.guild || message.guild.id !== config.main.guild.id) {
    message.channel.send({ content: `You cannot use this command outside of \`${config.main.guild.name}\`!` })
    return
  }
  if(!args[1]) {
    this.help(client, message, args)
    return
  }

  const monthLengths = {
    long: [1, 3, 5, 7, 8, 10, 12],
    short: [4, 6, 9, 11],
    february: [2]
  }

  const month = parseInt(args[0])
  const day =   parseInt(args[1])

  if(!month || !day) {
    message.channel.send({ content: "specify valid numbers pls. eg: `birthday 4 20` for april 20" })
    return
  }

  if(month < 1 || month > 12) {
    message.channel.send({ content: "that is not a monthdfjh. eg: `birthday 4 20` for april 20" })
    return
  }

  let maxDay
  if(monthLengths.long.includes(month)) maxDay = 31
  if(monthLengths.short.includes(month)) maxDay = 30
  if(monthLengths.february.includes(month)) maxDay = 29

  if(day < 1 || day > maxDay) {
    message.channel.send({ content: "invalid day for the month!" })
    return
  }

  
  const msg = await message.channel.send({ content: ":thinking: Hmmm" })
  const date = new Date(1970, month - 1, day)
  const dateStr = date.toLocaleString("default", { month: "long", day: "numeric" })
  // const isoDateString = `-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`


  const confirmEmbed = new Discord.MessageEmbed()
  embedder.addAuthor(confirmEmbed, message.author)
    .setColor(config.main.colours.help)
    .setTitle("Confirm Date")
    .setDescription(`Here is what I got: \`${dateStr}\`. Is this correct?`)

  const emoji = "✅"
  await msg.edit({ embeds: [confirmEmbed] })
  msg.react(emoji)

  const filter = (reaction, reactor) => (reaction.emoji.name === emoji) && (reactor.id === message.author.id)
  const collector = msg.createReactionCollector({ max: 1, time: 15000, filter })
  collector.on("collect", async () => {
    const responseEmbed = new Discord.MessageEmbed()
    embedder.addAuthor(responseEmbed, message.author)
      .setColor(config.main.colours.success)
      .setTitle(`✅ Check Mark.`)
      .setDescription(`hoang will be notified of your birthday`)
  
    const secretChannel = await client.channels.fetch("767186885893292042").catch(() => {})
    secretChannel.send(`${message.author} says their birthday is \`${dateStr}\``)
      .then(() => msg.edit({ embeds: [responseEmbed] }))
      .catch(() => message.channel.send({ content: "hoang cant be notified because the channel doesnt exist or something is broken or osmethging. tell hoang yourself i guess" }))
  })
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const { config } = index
  const { commandHelpEmbed } = client.functions

  const embed = commandHelpEmbed(message, {
    title: "**Birthday**",
    description: [
      "Hoang wanted a birthday command. :O",
      "Tell the bot your birthday and it will be sent to Hoang so he doesn't have to deal with humans or something.",
      "You **must** specify the month as a number from 1 to 12 because billzo is lazy."
    ].join(" "),
    syntax: `${config.main.prefix}birthday <NUMERIC Month> <Day>`,
    example: [
      `**My birthday is April 20th.**`,
      `${config.main.prefix}birthday 4 20`,
    ].join("\n"),
  })
  
  message.channel.send({ embeds: [embed] })
}

exports.cooldown = 5