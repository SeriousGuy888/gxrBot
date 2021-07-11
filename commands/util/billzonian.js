exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { axios, csv, Discord } = index
  const { arrayHelper, embedder } = client.util
  const { didYouMean } = client.functions

  const repoUrl = "https://github.com/SeriousGuy888/Billzonian"
  const dictionaryUrl = "https://seriousguy888.github.io/Billzonian/vocabulary.csv"



  const response = await axios.get(dictionaryUrl)
  if(response.status !== 200) return message.channel.send("An error occurred while requesting the dictionary data.")

  const responseData = response.data
  const dictionaryData = await csv().fromString(responseData)

  const itemsPerPage = 4
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
      searchResults = dictionaryData.filter(e => {
        return (
          e.word.toLowerCase().includes(searchTerm)
          || e.translation.toLowerCase().includes(searchTerm)
          || e.alt_forms.toLowerCase().includes(searchTerm)
          // || e.notes.toLowerCase().includes(searchTerm)
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
        "Command Syntaxes: `billzonian [page num]` **or** `billzonian [search term]`",
        "`Alt` indicates alternate forms and spellings of the same word.",
        "",
        "This dictionary is not a complete collection of all Billzonian words, as there are quite a few Billzonian words and there are new ones being added all the time. You may see Billzonian words that are not (yet) documented in this dictionary.",
        `If another word, old or new, is missing, you can [make an issue here.](${repoUrl})`,
        "",
        "------------------------------------------------",
        `:mag: Search Term: \`${searchTerm || "[None]"}\``,
        "------------------------------------------------",
        "",
        "\u200b",
      ].join("\n"))
      .setFooter(`Page ${page} of ${maxPages}`)
    


    if(maxPages > 0) {
      // const exactMatchIndex = searchResults.findIndex(e => e.word.toLowerCase() === searchTerm && e.word) // empty strings dont count
      // if(exactMatchIndex >= 0) {
      //   searchResults = arrayHelper.moveArrayItem(searchResults, exactMatchIndex, 0)
      //   searchResults[0].isExactMatch = true
      // }

      searchResults.forEach(e => {
        if(e.word && e.word.toLowerCase() === searchTerm) {
          e.isExactMatch = true
          searchResults = arrayHelper.moveArrayItem(searchResults, searchResults.indexOf(e), 0)
        }
      })


      for(let i = 0; i < itemsPerPage; i++) {
        const entryIndex = i + ((page - 1) * itemsPerPage)
        const wordData = searchResults[entryIndex]

        if(!wordData) {
          break
        }

        const ipaReadings = wordData.ipa.split("|")
        const alts = wordData.alt_forms.split("|")
        const translation = wordData.translation
        const example = wordData.example
        const notes  = wordData.notes

        responseEmbed.addField(
          `${wordData.word && "**" + wordData.word + "**"} \`${wordData.pos}\` ${wordData.isExactMatch ? "*(⭐ Exact Match)*" : ""}`,
          [
            ipaReadings         && ipaReadings.map(e => `/[${e}](http://ipa-reader.xyz/?text=${e.replace(/ /g, "%20")})/`).join(" or "),
            wordData.alt_forms  && `Alt: ${alts.map(e => "`" + e + "`").join(", ")}`,
            translation         && numberise(translation, false, false) + "\n",
            example             && numberise(example, true, false),
            notes               && numberise(notes, false, true),
          ].filter(e => e).join("\n"),
          true
        )

        if((i + 1) % 2 === 0) {
          embedder.addBlankField(responseEmbed)
        }
      }
    }
    else {
      const allWords = dictionaryData.map(e => e.word)
      let allSimilarities = didYouMean(searchTerm, allWords).map(e => e.target)
      allSimilarities = [...new Set(allSimilarities)] // remove duplicates from function return
      const topSimilarities = []

      for(let i = 0; i < 8; i++) {
        topSimilarities.push(allSimilarities[i])
      }

      const wordSuggestionsStr = "```\n" + topSimilarities.map(e => `- ${e}`).join("\n") + "```"


      responseEmbed
        .addField("No Words Found :(", [
          "Try double checking your search term?",
          "Attempt reakratising cy search term?",
        ].join("\n"))
        .addField("\u200b", "\u200b")
        .addField("Did you mean one of these words?", wordSuggestionsStr.slice(0, 1024))
    }
    embedder.addBlankField(responseEmbed)


    return targetMessage.edit("pagdfs")
      .then(async editedMsg => {
        editedMsg.edit(responseEmbed)

        if(maxPages <= 1) { // return when there are no words found or there is only one page
          return
        }

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