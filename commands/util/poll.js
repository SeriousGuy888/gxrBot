exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { commander, embedder, permisser, poller } = client.util

  if(!args[0] || !args[1]) {
    this.help(client, message, args)
    return
  }

  if(!message.guild) {
    message.channel.send("This command may only be executed in a guild!")
    return
  }
  if(!permisser.hasPermission(message.member, ["ADMINISTRATOR"])) {
    message.channel.send("Administrator permissions are required for you to use this command!")
    return
  }

  let pollChannel = await commander.getMentionArgs(args[0], 1, message, true)
  if(!pollChannel) return message.channel.send("Please specify a valid channel that is in this guild!")
  if(!pollChannel.isText()) return message.channel.send("Specify a text channel!")

  switch(args[1].toLowerCase()) {
    case "create":
      const question = args.slice(2).join(" ").trim()
      if(!question) return this.help(client, message, args)

      let attachmentImage = message.attachments.first()?.url


      let poll = {
        owner: message.author.id,
        channel: pollChannel.id,
        image: attachmentImage,
        question,
        wip: true,
        options: new Set(),
      }


      const emb = await poller.getPollEmbed(poll)
      const msg = await message.channel.send(emb)
      await msg.react(config.polls.emoji)

      const filter = (reaction, reactor) => (reactor.id === message.author.id)
      const collector = msg.createReactionCollector(filter, {
        time: config.polls.collectorTimeout,
        dispose: true
      })
        .on("collect", async (reaction, reactor) => {
          collector.resetTimer({ time: config.polls.collectorTimeout })

          if(reaction.emoji.name === config.polls.emoji) {
            const startPollResult = await poller.startPoll(poll)
            if(startPollResult?.error) {
              poll.options = new Set()
              message.channel.send(startPollResult.message)
              reaction.users.remove(reactor)
            }
            else {
              collector.stop()
            }
          }
          else {
            if(reaction.emoji instanceof Discord.GuildEmoji) {
              message.channel.send("Custom emojis are currently not supported!")
              return
            }
            if(poll.options.size < config.polls.maxOptions) {
              poll.options.add(reaction.emoji.name)
              const newEmb = await poller.getPollEmbed(poll)
              msg.edit(newEmb)
            }
          }
        })
        .on("remove", async (reaction, reactor) => {
          collector.resetTimer({ time: config.polls.collectorTimeout })

          if(reaction.emoji.name === config.polls.emoji)
            return
          poll.options.delete(reaction.emoji.name)
          const newEmb = await poller.getPollEmbed(poll)
          msg.edit(newEmb)
        })
        .on("end", collected => msg.edit("No longer listening for reactions."))

      break
    case "close":
      const pollClosedStatus = await poller.stopPoll(pollChannel, args.slice(2).join(" "), message.author.id)

      const pollCloseEmb = new Discord.MessageEmbed()
      embedder.addAuthor(pollCloseEmb, message.author)
        .setColor(pollClosedStatus.error ? config.main.colours.error : config.main.colours.success)
        .setTitle("Close Poll")
        .setDescription(pollClosedStatus?.message)

      message.channel.send(pollCloseEmb)
      break
    default:
      this.help(client, message, args)
      return
  }
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const { config } = index
  const { commandHelpEmbed } = client.functions

  const embed = commandHelpEmbed(message, {
    title: "**Poll Command**",
    description: [
      "Create a fancy poll with bar graphs!",
      "*Note that only members with the Administrator permission can create polls.*",
      "\n\nYou can also attach an image by sending the command with an image attachment!",
    ].join(" "),
    syntax: `${config.main.prefix}poll <Channel or "." for current channel> <(create <question>) | (close <Poll ID>)>`,
    example: [
      `**Create Poll in This Channel**`,
      `${config.main.prefix}poll . create Election or Something:tm:`,
      "",
      `**End Poll in This Channel**`,
      `${config.main.prefix}poll . close 1234213412341234`,
      "",
      `**Create Poll in Some Other Channel**`,
      `${config.main.prefix}poll #channel-id-or-mention create Election or Something:tm:`,
      "",
      `**End Poll in Some Other Channel**`,
      `${config.main.prefix}poll #channel-id-or-mention close 1234213412341234`,
    ].join("\n"),
  })
  
  message.channel.send(embed)
}