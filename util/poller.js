const index = require("../index.js")
const { client, config, Discord } = index
const { messenger } = client.util


exports.getPollEmbed = async (pollObject, closed, message) => {
  const pollEmb = new Discord.MessageEmbed()
    .setColor("#dfdf23")
    .setTitle("Poll")
    
  if(pollObject) {
    pollEmb.setDescription(pollObject.question)
    
    if(pollObject.wip) {
      pollEmb
        .setTitle("Setup Poll")
        .addField("Channel", pollObject.channel)
        .addField("Instructions for Poller", `React with ${config.polls.emoji} to **begin polling**.\nReact with any other emoji to **add an option**.`)

      const options = [...pollObject.options] ?? []
      if(!options.length) {
        pollEmb.setFooter("Go on! Add an option!")
      }
      else {
        for(let i = 0; i < options.length; i++) {
          pollEmb.addField(`\`Option ${i + 1}\``, options[i].toString(), true)
        }
    
        if(pollObject.wip && options.length >= config.polls.maxOptions) {
          pollEmb.addField("Max Options Reached", `You can only have \`${config.polls.maxOptions}\` options in one poll.`, true)
        }
      }
    }
    else {
      pollEmb.setFooter(`${config.main.prefix}poll ${message.channel.id} close ${pollObject.id}`)
    }

    if(pollObject.image) pollEmb.setImage(pollObject.image)
  }
  if(closed) {
    const originalEmbed = message.embeds[0]

    pollEmb
      .setColor("#bf2323")
      .setTitle("Closed Poll")
      .setDescription(originalEmbed.description || "[No Question Provided]")
      .setFooter("Poll Closed")
      .setTimestamp()
    if(originalEmbed.image) {
      pollEmb.setImage(originalEmbed.image.url)
    }

    let reactions
    let cacheChannel = message.guild.channels.cache.get(message.channel.id)

    await cacheChannel.messages.fetch(message.id)
      .then((reactionMessage) => {
        reactions = reactionMessage
          .reactions
          .cache
          .each(async (reaction) => reaction.users.fetch())
      })

    const allReactionKeys = [...reactions.keys()]
    const options = []

    let maxCount = 0 // option with the highest vote count

    for(const key of allReactionKeys) {
      const reaction = reactions.get(key)

      if(!reaction.me) {
        // don't count the reaction if the bot has not reacted to it
        continue
      }

      options.push(key)
      maxCount = Math.floor(Math.max(maxCount, reaction.count - 1))
    }

    let resultsField = []
    for(const i in options) {
      const reaction = reactions.get(options[i])
      const votes = reaction.count - 1 // remove the bot's own reaction from the final count

      const barColour = config.polls.bars[i % config.polls.bars.length]
      let barSize = Math.round((votes / maxCount) * config.polls.maxBarLength)
      resultsField.push(reaction.emoji.toString() + ` | \`${votes}\` | ${barColour.repeat(barSize)}`)
    }

    pollEmb.addField("Results", resultsField.join("\n") || "the poll was broken lol check the reactions i guess")
  }

  return pollEmb
}

exports.startPoll = async pollObject => {
  // const pollsColl = db.collection("polls")

  const channel = await client.channels.fetch(pollObject.channel)
  pollObject.options = [...pollObject.options]
  if(!pollObject.image) {
    pollObject.image = null
  }

  if(!pollObject.options.length) {
    return {
      error: true,
      message: "Provide at least one option!"
    }
  }

  pollObject.wip = false
  pollObject.timestamp = new Date()

  const message = await messenger.loadingMessage(channel, { title: "Loading Poll..." })
  pollObject.id = message.id
  
  // await pollsColl.doc(message.id).set(pollObject)
  
  const emb = await this.getPollEmbed(pollObject, false, message)
  message.edit({ embeds: [emb] })

  pollObject.options.forEach(async opt => {
    await message.react(opt)
  })
}

exports.stopPoll = async (channel, pollId, requester) => {
  if(!pollId) {
    return {
      error: true,
      message: "No Poll ID was provided."
    }
  }

  const message = await channel.messages.fetch(pollId).catch(() => {})
  if(
    !message ||
    message.author.id !== client.user.id ||
    message.embeds[0].title !== "Poll"
  ) {
    return { error: true, message: "Invalid Poll ID" }
  }

  let duckingError = false
  const emb = await this.getPollEmbed(null, true, message)
  await message.edit({ embeds: [emb] }).catch(err => {
    console.log(err)
    duckingError = true
  })
  
  return {
    error: duckingError,
    message: duckingError ? "couldnt close poll due to some error i guess" : `Closed [poll](${message.url}).`
  }
}