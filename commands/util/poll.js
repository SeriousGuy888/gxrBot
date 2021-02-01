exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { embedder, permisser, poller } = client.util

  if(!args[0] || !args[1]) {
    this.help(client, message, args)
    return
  }

  let invalidChannelId = false
  let queryChannelId = args[0]
  if(queryChannelId === ".")
    queryChannelId = message.channel.id
  let pollChannel = await client.channels.fetch(queryChannelId)
    .catch(() => invalidChannelId = true)
  if(invalidChannelId) {
    message.channel.send("Invalid channel ID specified. Make sure it is a valid ID (a string of numbers), and that I have access to the channel. You can also use a period (`.`) to specify the channel in which the command is being executed.")
    this.help(client, message, args)
    return
  }

  switch(args[1].toLowerCase()) {
    case "open":
    case "start":
    case "create":
      if(message.guild && !permisser.hasPermission(message.member, ["ADMINISTRATOR", "MANAGE_CHANNELS"])) {
        if(pollChannel.id !== message.channel.id) {
          pollChannel = await client.channels.fetch(message.channel.id)
          message.channel.send(`Your poll channel setting was ignored because you do not have administrator or manage channels permissions. Your poll will be created in this channel, where you are running the command.`)
        }
      }
      if(message.guild && pollChannel.guild?.id !== message.guild.id) {
        message.channel.send("Specify a channel within this guild!")
        return
      }


      const question = args.slice(2).join(" ")
      if(!question) {
        this.help(client, message, args)
        return
      }


      let poll = {
        owner: message.author.id,
        channel: pollChannel.id,
        question,
        wip: true,
        options: new Set()
      }


      const emb = await poller.getPollEmbed(poll)
      
      const msg = await message.channel.send(emb)
      await msg.react(config.polls.emoji)
      const filter = (reaction, reactor) => (reactor.id === message.author.id)
      const collector = msg.createReactionCollector(filter, { time: config.polls.collectorTimeout, dispose: true })
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
              message.channel.send("Custom emojis cannot be used in these polls!")
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
        .on("end", collected => {
          msg.edit("No longer listening for reactions.")
        })

      break
    case "close":
    case "stop":
    case "end":
      const pollClosedStatus = await poller.stopPoll(args.slice(2).join(" "), message.author.id)
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
      "Anybody is allowed to make a poll, not just server admins,",
      "but you can only close a poll that you made."
    ].join(" "),
    syntax: `${config.main.prefix}poll <Channel ID | .> <(create <question>) | (close <Poll ID>)>`,
    example: [
      `**Create Poll in This Channel**`,
      ` ${config.main.prefix}poll . create Election or Something:tm:`,
      "",
      `**End Poll in This Channel**`,
      ` ${config.main.prefix}poll . close 1234213412341234`,
      "",
      `**Create Poll in Some Other Channel __SERVER ADMIN ONLY__**`,
      ` ${config.main.prefix}poll 1234213412341234 create Election or Something:tm:`,
      "",
      `**End Poll in Some Other Channel**`,
      ` ${config.main.prefix}poll 1234213412341234 close 1234213412341234`,
    ].join("\n"),
  })
  
  message.channel.send(embed)
}

exports.cooldown = 60