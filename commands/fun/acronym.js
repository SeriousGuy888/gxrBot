exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { fs, path, config, Discord } = index
  const { embedder } = client.util

  const acronym = args
    .join("")
    .replace(/[^a-z]/gi, "")
    .toLowerCase()
    .slice(0, 64)

  if(!acronym)
    return this.help(client, message, args)

  const wordsStr = fs.readFileSync(path.resolve("./assets/words/20k_common.txt"), "utf8")
  const words = wordsStr.split("\n")

  const acronymLetters = acronym.split("")
  const expansion = []

  let wordsByStartingLetter = {}
  for(const letter of acronymLetters) {
    let wordsStartingWithLetter
    
    if(wordsByStartingLetter[letter]) {
      wordsStartingWithLetter = wordsByStartingLetter[letter]
    }
    else {
      wordsStartingWithLetter = words.filter(w => w.toLowerCase().startsWith(letter) && w.length > 3)
    }

    let word = wordsStartingWithLetter[Math.floor(Math.random() * wordsStartingWithLetter.length)]
    word = word.toUpperCase()
    word = ":regional_indicator_" + word.charAt(0).toLowerCase() + ":" + word.slice(1)

    expansion.push(word)
  }

  const combinedExpansion = expansion
    .join("\n")
    .slice(0, 2048)

  const emb = new Discord.MessageEmbed()
  embedder.addAuthor(emb, message.author)
    .setColor(config.main.colours.success)
    .setTitle("Acronym Expansion")
    .setDescription(combinedExpansion)
    .addField("\u200b", [
      "Wordlist stolen from [here](https://github.com/first20hours/google-10000-english/blob/master/20k.txt).",
      "There are probably some swear words and also fake words but there are 20,000 of these so I'm not removing them."
    ].join(" "))
    .setFooter("Not my fault™️ -billzo")

  message.channel.send(emb)
}

exports.help = async (client, message, args) => {
  message.channel.send("this is a command that when given an acronym, will give you an expansion of that acronym")
}

exports.disabled = "temp disabled during discord.js v13 update"