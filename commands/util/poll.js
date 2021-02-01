exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { embedder, poller } = client.util

  if(!args[0] || !args[1]) {
    this.help(client, message, args)
    return
  }

  let invalidChannelId = false
  let queryChannelId = args[0]
  if(queryChannelId === ".")
    queryChannelId = message.channel.id
  const pollChannel = await client.channels.fetch(queryChannelId)
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
        .on("collect", async reaction => {
          collector.resetTimer({ time: config.polls.collectorTimeout })
          if(reaction.emoji instanceof Discord.GuildEmoji) {
            message.channel.send("Custom emojis cannot be used in these polls!")
            return
          }

          if(reaction.emoji.name === config.polls.emoji) {
            poller.startPoll(poll)
            collector.stop()
          }
          else {
            if(poll.options.size < config.polls.maxOptions) {
              poll.options.add(reaction.emoji.name)
              const newEmb = await poller.getPollEmbed(poll)
              msg.edit(newEmb)
            }
          }
        })
        .on("remove", async reaction => {
          collector.resetTimer({ time: config.polls.collectorTimeout })

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
        .setDescription(pollClosedStatus.message)
      
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
    description: "Create a fancy poll with bar graphs!",
    syntax: `${config.main.prefix}poll <Channel ID | .> <(create <question>) | (close <Poll ID>)>`,
    example: [
      `**Create Poll in This Channel**`,
      ` ${config.main.prefix}poll . create Election or Something:tm:`,
    ].join("\n"),
  })
  
  message.channel.send(embed)
}