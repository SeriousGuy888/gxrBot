exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { axios, config, csv, Discord } = index
  const { embedder, logger } = client.util

  const dictionaryUrl = "https://seriousguy888.github.io/Billzonian/vocabulary.csv"

  try {
    const response = await axios.get(dictionaryUrl)

    if(response.status === 200) {


      const responseData = response.data
      const dictionaryData = await csv().fromString(responseData)

      const itemsPerPage = 9
      let maxPages = Math.ceil(dictionaryData.length / itemsPerPage)

      let page = 1
      let pageSpecified = false

      const params = args.join(" ")
      const paramsInt = Math.abs(parseInt(params))
      if(paramsInt) {
        page = Math.min(paramsInt, maxPages)
        pageSpecified = true
      }



      
      let msg = await message.channel.send("dictionary")

      
      const numberise = (str, useLetters, bulletPoints) => {
        const lines = str.split("|")
        const numberedLines = []
        for(let i in lines) {
          let number = `\`${(parseInt(i) + 1).toString() + "."}\``
          if(useLetters) {
            const letters = "abcdefghijklmnopqrstuvwxyz"
            number = letters.charAt(i % letters.length) + "."
          }
          if(bulletPoints) {
            number = "•"
          }

          numberedLines.push(`${number} ${lines[i]}`)
        }

        return numberedLines.join("\n")
      }

      const displayDictionary = async (targetMessage) => {
        let searchTerm = ""
        let searchResults = dictionaryData
        if(!pageSpecified) {
          searchTerm = params.toLowerCase()
          searchResults = dictionaryData.filter(e => e.word.toLowerCase().includes(searchTerm))
        }

        maxPages = Math.ceil(searchResults.length / itemsPerPage)



        const responseEmbed = new Discord.MessageEmbed()
        embedder.addAuthor(responseEmbed, message.author)
          .setColor("#fca503")
          .setTitle("The Billzonian-English Dictionary")
          .setURL(dictionaryUrl)
          .setDescription([
            "`billzonian [page]` to go to a page, **or** `billzonian [search term]` to search for a word.",
            "`AF` = Alt Forms | `AS` = Alt Spellings | `IR` = Irregular!",
            "",
            `Search Term: \`${searchTerm || "[None]"}\``,
            "",
            "⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️⬇️",
          ].join("\n"))
          .setFooter(`Page ${page} of ${maxPages}`)
        


        for(let i = 0; i < itemsPerPage; i++) {
          const entryIndex = i + ((page - 1) * itemsPerPage)
          const wordData = searchResults[entryIndex]

          if(!wordData) {
            break
          }

          const translation = wordData.translation
          const example = wordData.example
          const notes  = wordData.notes

          responseEmbed.addField(
            `${wordData.word && "**" + wordData.word + "**"} \`${wordData.partOfSpeech}\``,
            [
              translation  && numberise(translation, false, false) + "\n",
              example      && numberise(example, true, false),
              notes        && numberise(notes, false, true),
            ].filter(e => e).join("\n"),
            true
          )

          if((i + 1) % 3 === 0) {
            embedder.addBlankField(responseEmbed)
          }
        }
        responseEmbed.addField("\u200b", "⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️⬆️")
  
    
        return await targetMessage.edit(responseEmbed)
          .then(async editedMsg => {
            const reactionEmojis = ["⏪", "◀️", "▶️", "⏩"]
            const reactionFilter = (reaction, user) => user.id === message.author.id && reactionEmojis.includes(reaction.emoji.name)
    
            editedMsg.awaitReactions(reactionFilter, { max: 1, time: 60000 })
              .then(async collected => {
                const emojiName = collected.first().emoji.name
                editedMsg.reactions.resolve(emojiName).users.remove(message.author).catch(() => {}) // remove user's reaction
                switch(emojiName) {
                  case "⏪":
                    page = 1
                    break
                  case "◀️":
                    page--
                    break
                  case "▶️":
                    page++
                    break
                  case "⏩":
                    page = maxPages
                    break
                }
                page = Math.max(Math.min(page, maxPages), 1)
                
                editedMsg.edit(await displayDictionary(editedMsg))
              })
              .catch(() => {
                editedMsg.edit("No longer listening for reactions.", { embed: responseEmbed })
              })
            
            for(const loopEmoji of reactionEmojis) {
              await editedMsg.react(loopEmoji)
            }
          })
      }

      msg = await displayDictionary(msg)
    }
    else {
      message.channel.send("Request returned a status code that was not 200. Ask billzo to check the logs.")
      logger.log(response, "billzonian")
    }
  } catch(error) {
    message.channel.send("An error has occurred. Ask billzo to check the logs.")
    logger.log(error, "billzonian")
  }
}