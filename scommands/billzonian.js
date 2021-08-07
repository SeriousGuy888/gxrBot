const index = require("../index.js")

const { client, Discord } = index
const { arrayHelper, embedder } = client.util
const { didYouMean } = client.functions
const axios = require("axios")
const csv = require("csvtojson")

const { MessageActionRow, MessageButton } = Discord

const repoUrl = "https://github.com/SeriousGuy888/Billzonian"
const dictionaryUrl = "https://seriousguy888.github.io/Billzonian/vocabulary.csv"
  
module.exports = {
  name: "billzonian",
  description: "Look up a word in the Billzonian-English Dictionary.",
  options: [
    {
      type: "STRING",
      name: "word_or_page",
      description: "WORD to search for OR a PAGE NUMBER."
    }
  ],
  defer: true,
  execute: async (interaction, options) => {
    const response = await axios.get(dictionaryUrl)
    if(response.status !== 200) return interaction.followUp("An error occurred while requesting the dictionary data.")

    const responseData = response.data
    const dictionaryData = await csv().fromString(responseData)

    const itemsPerPage = 4
    let maxPages = Math.ceil(dictionaryData.length / itemsPerPage)
    let page = 1
    let pageSpecified = false

    const params = options.getString("word_or_page") || ""
    const paramsInt = Math.abs(parseInt(params))
    if(paramsInt) {
      page = Math.min(paramsInt, maxPages)
      pageSpecified = true
    }



    
    let msg = await interaction.followUp({ content: "dictionary" })

    
    const numberise = (str, useLetters, bulletPoints) => {
      const lines = str.split("|")
      const numberedLines = []
      for(let i in lines) {
        let number = `\`${(parseInt(i) + 1).toString() + "."}\``
        if(useLetters) {
          const letters = "abcdefghijklmnopqrstuvwxyz"
          number = "`" + letters.charAt(i % letters.length) + ".`"
        }
        if(bulletPoints) {
          number = "\`•\`"
        }

        numberedLines.push(`${number} ${lines[i]}`)
      }

      return numberedLines.join("\n")
    }

    const displayDictionary = async (targetMessage, disableButtons) => {
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
      


      if(maxPages > 0) {
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
              wordData.alt_forms  && `\`Alt:\` ${alts.join(", ")}`,
              translation         && numberise(translation, false, false) + "\n",
              example             && numberise(example, true, false) + "\n",
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


      const row = new MessageActionRow().addComponents(
        new MessageButton()
          .setCustomId("first")
          .setLabel("<<")
          .setStyle("SECONDARY")
          .setDisabled(page <= 1),
        new MessageButton()
          .setCustomId("prev")
          .setLabel("<")
          .setStyle("SECONDARY")
          .setDisabled(page <= 1),
        new MessageButton()
          .setCustomId("curr")
          .setLabel(`Page ${page} of ${maxPages}`)
          .setStyle("PRIMARY")
          .setDisabled(true),
        new MessageButton()
          .setCustomId("next")
          .setLabel(">")
          .setStyle("SECONDARY")
          .setDisabled(page >= maxPages),
        new MessageButton()
          .setCustomId("last")
          .setLabel(">>")
          .setStyle("SECONDARY")
          .setDisabled(page >= maxPages),
      )
      if(disableButtons) row.components.map(comp => comp.setDisabled(true))

      return targetMessage.edit({
        embeds: [responseEmbed],
        components: [row]
      }).then(editedMsg => {
        const filter = (inter) => {
          if(inter.user.id === interaction.user.id) return true
          else {
            inter.reply({
              content: `Only ${interaction.user.toString()} is allowed to use this button. Use \`/billzonian\` for yourself to browse the dictionary.`,
              ephemeral: true
            }).catch(() => {})
            return false
          }
        }

        const collector = editedMsg.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 })

        collector.on("end", (collected) => {
          if(collector.endReason) {
            if(!collected.first()) return
            const buttonId = collected.first().customId
            switch(buttonId) {
              case "first":
                page = 1
                break
              case "prev":
                page--
                break
              case "next":
                page++
                break
              case "last":
                page = maxPages
                break
            }
  
            collected.first().deferUpdate().catch(() => {})
            displayDictionary(editedMsg)
          }
          else { // if the timer expired, edit message and disable all buttons
            displayDictionary(editedMsg, true)
          }
        })
      })
    }

    msg = displayDictionary(msg)
  }
}