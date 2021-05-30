exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { axios, csv, Discord } = index
  const { arrayHelper, embedder, logger } = client.util
  const { didYouMean } = client.functions

  const repoUrl = "https://github.com/SeriousGuy888/Billzonian"
  const dictionaryUrl = "https://seriousguy888.github.io/Billzonian/vocabulary.csv"



  const response = await axios.get(dictionaryUrl)

  if(response.status === 200) {
    const responseData = response.data
    const dictionaryData = await csv().fromString(responseData)

    const itemsPerPage = 3
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
          const letters = "abðdefghijklmnopqrstuvwxyz"
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
        searchResults = dictionaryData.filter(e => {
          return (
            e.word.toLowerCase().includes(searchTerm) ||
            e.translation.toLowerCase().includes(searchTerm) ||
            e.notes.toLowerCase().includes(searchTerm)
          )
        })
      }

      maxPages = Math.ceil(searchResults.length / itemsPerPage)



      const responseEmbed = new Discord.MessageEmbed()
      embedder.addAuthor(responseEmbed, message.author)
        .setColor("#fca503")
        .setTitle("The Billzonian-English Dictionary")
        .setURL(dictionaryUrl)
        .setDescription([
          "`billzonian [page]` to go to a page, **or** `billzonian [search term]` to search.",
          "`AF` = Alt Forms | `AS` = Alt Spellings | `IR` = Irregular!",
          "",
          "Is a word missing?",
          "Does a word bea missing?",
          `[Make an issue here.](${repoUrl})`,
          "",
          "------------------------------------------------",
          `:mag: Search Term: \`${searchTerm || "[None]"}\``,
          "------------------------------------------------",
          "",
          "\u200b",
        ].join("\n"))
        .setFooter(`Page ${page} of ${maxPages}`)
      


      if(maxPages > 0) {
        const exactMatchIndex = searchResults.findIndex(e => e.word.toLowerCase() === searchTerm && e.word) // empty strings dont count
        if(exactMatchIndex >= 0) {
          searchResults = arrayHelper.moveArrayItem(searchResults, exactMatchIndex, 0)
          searchResults[0].isExactMatch = true
        }


        for(let i = 0; i < itemsPerPage; i++) {
          const entryIndex = i + ((page - 1) * itemsPerPage)
          const wordData = searchResults[entryIndex]

          if(!wordData) {
            break
          }

          const ipaReadings = wordData.ipa.split("|")
          const translation = wordData.translation
          const example = wordData.example
          const notes  = wordData.notes

          responseEmbed.addField(
            `${wordData.word && "**" + wordData.word + "**"} \`${wordData.pos}\``,
            [
              wordData.isExactMatch && "⭐ __EXACT MATCH__ ⭐\n",
              ipaReadings  && ipaReadings.map(e => `/[${e}](http://ipa-reader.xyz/?text=${e.replace(/ /g, "%20")})/`).join(" or "),
              translation  && numberise(translation, false, false) + "\n",
              example      && numberise(example, true, false),
              notes        && numberise(notes, false, true),
            ].filter(e => e).join("\n"),
            !wordData.isExactMatch // make field not inline if exact match
          )
          if(wordData.isExactMatch) {
            embedder.addBlankField(responseEmbed)
          }

          if((i + 1) % 3 === 0) {
            embedder.addBlankField(responseEmbed)
          }
        }
      }
      else {
        const allWords = dictionaryData.map(e => e.word)
        const allSimilarities = didYouMean(searchTerm, allWords)
        const topSimilarities = []

        for(let i = 0; i < 8; i++) {
          topSimilarities.push(allSimilarities[i].target)
        }

        const wordSuggestionsStr = "```\n" + topSimilarities.map(e => `- ${e}`).join("\n") + "```"


        responseEmbed
          .addField("No Words Found :(", [
            "Try double checking your search term?",
            "Remember that `C` has been removed from Billzonian!",
            "",
            "Attempt reverifying ðy seartsh term?",
            "Rekollekt ðat `C` has beed nuked from Billzonian!"
          ].join("\n"))
          .addField("\u200b", "\u200b")
          .addField("Did you mean one of these words?", wordSuggestionsStr.slice(0, 1024))
      }
      embedder.addBlankField(responseEmbed)

  
      return targetMessage.edit(responseEmbed)
        .then(async editedMsg => {
          const reactionEmojis = ["⏪", "◀️", "▶️", "⏩"]
          const reactionFilter = (reaction, user) => user.id === message.author.id && reactionEmojis.includes(reaction.emoji.name)
  
          editedMsg.awaitReactions(reactionFilter, { max: 1, time: 60000 })
            .then(async collected => {
              const emojiName = collected.first().emoji.name
              editedMsg.reactions.resolve(emojiName).users.remove(message.author) // remove user's reaction
                .catch(() => { return })
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
              
              editedMsg.edit(displayDictionary(editedMsg))
            })
            .catch(() => {
              editedMsg.edit("No longer listening for reactions.", { embed: responseEmbed })
            })
          
          for(const loopEmoji of reactionEmojis) {
            await editedMsg.react(loopEmoji)
          }
        })
    }

    msg = displayDictionary(msg)
  }
  else {
    message.channel.send("Request returned a status code that was not 200. Ask billzo to check the logs.")
    logger.log(response, "billzonian")
  }
}