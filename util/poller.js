const index = require("../index.js")
const { client, config, Discord, db } = index
const { embedder, messenger } = client.util


exports.getPollEmbed = async (pollObject, closed, message) => {
  const owner = await client.users.fetch(pollObject.owner)

  const pollEmb = new Discord.MessageEmbed()
  embedder.addAuthor(pollEmb, owner)
    .setColor("#dfdf23")
    .setTitle(`Poll`)
    .setDescription(pollObject.question)
  if(pollObject.wip) {
    pollEmb
      .addField("Channel", pollObject.channel)
      .addField("Instructions for Poller", `React with ${config.polls.emoji} to **begin polling**.\nReact with any other emoji to **add an option**.`)
  }
  else if(closed) {
    pollEmb
      .setColor("#bf2323")
      .addField("Poll Closed", "This poll is no longer taking reactions.")
      .setFooter("Poll closed")
      .setTimestamp()
  }
  else {
    pollEmb
      .addField("Instructions", [
        "React with an option to **cast your vote**.",
        `${owner}, use \`${config.main.prefix}poll ${message.channel.id} close ${pollObject.id}\` to **close poll**.`
      ].join("\n"))
      .setFooter(`Poll ID: ${pollObject.id ?? "[ERROR]"}`)
  }
  embedder.addBlankField(pollEmb)

  const options = [...pollObject.options] ?? []
  if(!options.length && pollObject.wip) {
    pollEmb.setFooter("Go on! Add an option!")
  }
  else {
    const reactions = message?.reactions.cache
    let resultsField = []

    if(closed) {
      let maxCount = 0 // option with the highest vote count
      let total = 0


      for(const opt of options) {
        const reaction = reactions.get(opt)
        total += reaction.count
        maxCount = Math.floor(Math.max(maxCount, reaction.count - 1))
      }
      for(const i in options) {
        const reaction = reactions.get(options[i])
        const votes = reaction.count - 1

        const barColour = config.polls.bars[i % config.polls.bars.length]
        let barSize = (votes / maxCount) * config.polls.maxBarLength
        resultsField.push(reaction.emoji.name + ` | \`${votes}\` | ${barColour.repeat(barSize)}`)
      }

      pollEmb.addField("Results", resultsField.join("\n"))
    }
    else {
      for(let i = 0; i < options.length; i++) {
        pollEmb.addField(`\`Option ${i + 1}\``, options[i], true)
      }
    }


    if(pollObject.wip && options.length >= config.polls.maxOptions) {
      pollEmb.addField("Max Options Reached", `You can only have \`${config.polls.maxOptions}\` options in one poll.`, true)
    }
  }

  return pollEmb
}

exports.startPoll = async pollObject => {
  const pollsColl = db.collection("polls")

  const channel = await client.channels.fetch(pollObject.channel)
  pollObject.options = [...pollObject.options]

  if(!pollObject.options.length) {
    return {
      error: true,
      message: "Provide at least one option!"
    }
  }

  pollObject.wip = false


  const message = await messenger.loadingMessage(channel, { title: "Loading Poll..." })
  pollObject.id = message.id
  
  await pollsColl.doc(message.id).set(pollObject)
  
  const emb = await this.getPollEmbed(pollObject, false, message)
  message.edit(emb)

  pollObject.options.forEach(async opt => {
    await message.react(opt)
  })
}

exports.stopPoll = async (pollId, requester) => {
  if(!pollId)
    return {
      error: true,
      message: "No Poll ID was provided."
    }
  
  const pollRef = db.collection("polls").doc(pollId)
  const doc = await pollRef.get()
  const data = doc.data()

  if(!data) {
    return {
      error: true,
      message: "Poll does not exist!"
    }
  }

  const channel = await client.channels.fetch(data.channel)
  const message = await channel.messages.fetch(pollId)

  if(data.owner !== requester && requester !== client.user.id) {
    return {
      error: true,
      message: `Only <@${data.owner}> is allowed to close this [poll](${message.url})!`
    }
  }

  const emb = await this.getPollEmbed(data, true, message)
  await message.edit(emb)
  await pollRef.delete()
  
  return {
    message: `Successfully closed [poll](${message.url}).`
  }
}