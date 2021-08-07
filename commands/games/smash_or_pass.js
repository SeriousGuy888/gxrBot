exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { embedder, statTracker } = client.util
  const settings = config.smashOrPass

  // https://discord.js.org
  const guild = message.guild
  if(!guild) {
    message.channel.send("This command must be executed in a discord server! (Because )")
    return
  }

  const smashed = {}

  let smashes = 0
  let passes = 0

  const people = [...(await guild.members.fetch()).values()]
  
  const getBasicEmbed = () => {
    const emb = new Discord.MessageEmbed()
    embedder.addAuthor(emb, message.author)
      .setColor(settings.embedColour)
      .setTitle("Smash or Pass")
      .setURL("https://github.com/SeriousGuy888/G9L-Bot/issues/16")
    
    return emb
  }

  const getCandidate = (finished) => {
    const userIndex = Math.floor(Math.random() * people.length)
    let person = people[userIndex]
    people.splice(userIndex, 1) // delete from choices
  
    const candidateEmbed = getBasicEmbed()
    
    if(!finished) {
      const introduction = settings.introductions[Math.floor(Math.random() * settings.introductions.length)]
        .replace(/%s/gi, person)

      candidateEmbed
        .setDescription(introduction)
        .addField(`${settings.emojis.smash} Smashes`, smashes, true)
        .addField(`${settings.emojis.pass} Passes`, passes, true)
        .addField("\u200b", `Please make a choice within ${settings.timeout} seconds.\nReact with ${settings.emojis.stop} to stop playing immediately.`)
        .setFooter(`Remaining: ${people.length}`)
    }
    else {
      const smashedUsers = []
      const passedUsers = []

      for(const userId in smashed) {
        if(smashed[userId])
          smashedUsers.push(userId)
        else
          passedUsers.push(userId)
      }

      const getMentions = arr => (arr.map(uid => `<@${uid}>`).join("\n") || "None").slice(0, 1024)

      candidateEmbed
        .addField(`${settings.emojis.smash} Smashed (${smashedUsers.length})`, getMentions(smashedUsers), true)
        .addField(`${settings.emojis.pass} Passed (${passedUsers.length})`, getMentions(passedUsers), true)
        .setFooter(`Game Ended`)
    }

    return {
      embed: candidateEmbed,
      user: person
    }
  }


  const roundOne = getCandidate()
  let currentCandidate = roundOne.user
  const msg = await message.channel.send("How did you find this command?", { embed: roundOne.embed })

  const emojis = Object.values(settings.emojis)
  emojis.forEach(async emoji => await msg.react(emoji))
  const filter = (reaction, reactor) => (emojis.includes(reaction.emoji.name)) && (reactor.id === message.author.id)

  const collector = msg.createReactionCollector(filter, { time: settings.timeout * 1000 })
    .on("collect", async (reaction, reactor) => {
      reaction.users.remove(reactor).catch(() => {})
      collector.resetTimer()

      let endGame = false

      switch(reaction.emoji.name) {
        case settings.emojis.smash: // hammer
          if(currentCandidate) {
            smashes++
            statTracker.add(message.author.id, "sop_smash", 1)
            smashed[currentCandidate.id] = true
          }
          break
        case settings.emojis.pass: // passport control
          if(currentCandidate) {
            passes++
            statTracker.add(message.author.id, "sop_pass", 1)
            smashed[currentCandidate.id] = false
          }
          break
        case settings.emojis.stop: // exit/stop
          endGame = true
          collector.stop()
          break
      }

      const { embed, user } = getCandidate()
      currentCandidate = user
      if(currentCandidate && !endGame)
        msg.edit(embed)
      else
        collector.stop()
    })
    .on("end", async collected => {
      msg.edit(getCandidate(true).embed)
        // .then(m => {
        //   msg.edit(`No longer listening for reactions.\n(Results: ${m.url})`)
        // })
    })
}

exports.disabled = "temp disabled during discord.js v13 update"