module.exports = async (message) => {
  const index = require("../index.js")
  const { client, config, emoji, emojiDictionary } = index
  const { logger } = client.util
  

  const literalIdPrefix = config.autoResponses.settings.literalIdPrefix
  const emojiKey = config.autoResponses.settings.emojiKey
  const channelData = config.autoResponses.channels

  if(message.author.id === client.user.id)
    return
  if(!channelData[message.channel.id])
    return

  for(let loopResponse of channelData[message.channel.id]) {
    if(!loopResponse.enabled)
      continue

    const conditional = loopResponse.conditional
    let satisfiesConditions = false

    if(!conditional) satisfiesConditions = true
    else {
      if(conditional.enabled) {
        let testResults = [] // an array to store whether each tested condition passed

        const conditionList = conditional.conditions
        if(!conditionList) {
          logger.log(`Missing autoresponse condition list for channel ${message.channel.id}!`)
          break
        }
        for(let loopCondition of conditionList) {
          if(!loopCondition.enabled) continue

          if(loopCondition.type === "regex") {
            const content = message.content
            const passed = content.match(new RegExp(loopCondition.expression, loopCondition.flags))
            
            testResults.push(loopCondition.negate ? !passed : passed)
          }
          else {
            logger.log(`Unknown autoresponse condition type ${loopCondition.type} in autoresponse for channel ${message.channel.id}; skipping.`)
            continue
          }
        }

        if(conditional.allRequired)
          satisfiesConditions = testResults.every(e => e) // test if all the conditions passed
        else
          satisfiesConditions = testResults.some(e => e) // test if at least one condition passed
      }
      else satisfiesConditions = true
    }

    if(satisfiesConditions) {
      const messageList = loopResponse.messages
      const reactionList = loopResponse.reactions
      const { autoEmoji } = loopResponse

      if(messageList) {
        for(let loopMessage of messageList) {
          message.channel.send({ content: loopMessage.content, embed: loopMessage.embed || null }).then(msg => {
            if(loopMessage.options.autoDelete.enabled) {
              let timeout = loopMessage.options.autoDelete.timeout
              timeout = Math.min(Math.max(timeout, 1), 60 * 1000) // clamp timeout between 1ms and 1min
              setTimeout(() => { msg.delete() }, timeout)
            }
          })
        }
      }
      if(reactionList) {
        let reactionEmojis = []
      
        for(let loopReaction of reactionList) {
          if(loopReaction.startsWith(literalIdPrefix)) {
            let emojiStr = loopReaction.slice(literalIdPrefix.length)
            if(!emojiStr)
              return logger.log(`Emoji \`${loopReaction}\` invalid; skipping...`)
            reactionEmojis.push(emojiStr)
          }
          else {
            if(!emojiKey[loopReaction])
              logger.log(`Autoreaction emoji key ${loopReaction} not found. Skipping emoji...`)
            else
              reactionEmojis.push(emojiKey[loopReaction])
          }
        }
      
        for(let loopEmoji of reactionEmojis) {
          try {
            await message.react(loopEmoji)
          }
          catch(err) {
            logger.log(`Failed to add reaction ${loopEmoji} to message ${message.id} due to error \`${err}\``)
          }
        }
      }
      if(autoEmoji) {
        if(autoEmoji.enabled) {
          const { content } = message
          const messageWords = content.toLowerCase().replace(/[^a-z_ ]/gi, "").split(" ")
          for(let loopMessageWord of messageWords)
            loopMessageWord = loopMessageWord.toLowerCase()

          let successfulReactions = 0
          for(let loopWord of messageWords) {
            if(successfulReactions >= autoEmoji.maxEmojiCount)
              break
            let loopWordEmoji = emojiDictionary.getUnicode(loopWord)
            if(loopWordEmoji) {
              // do not react with national flag emojis if configured as such
              if(autoEmoji.blacklistNationalFlags && emoji.lib[loopWord].keywords.includes("nation"))
                continue
              await message.react(loopWordEmoji)
                .then(() => successfulReactions++)
                .catch(err => logger.log(err))
            }
          }
        }
      }
    }
  }
}