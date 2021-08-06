exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord
  const translate = index.translate

  if(!args[0]) return this.help(client, message, args)

  const msg = await message.channel.send("Waiting for response from Google Translate...")
  const maxOutputFieldLength = 1024
  const maxLanguageCount = 12

  const executeTranslations = async opts => {
    let { phrase, targetLangs } = opts
    if(!phrase) return ("Phrase not specified D:")
    if(!targetLangs) return phrase
    if(typeof targetLangs !== "object") return ("Invalid target language.") 

    let text = phrase
    for(let loopLang of targetLangs) {
      text = await translate(text, { from: "auto", to: loopLang.toLowerCase() }).catch(err => {
        return err
      })
    }
    return text
  }

  const trimString = (str, length) => str.length > length ? str.slice(0, length - 3).trim() + "..." : str

  let languages = ["fr", "ru", "zh-cn", "de", "en"]
  let originalText = args.join(" ")
  if(args[0] === "--languages" || args[0] === "-l") {
    languages = args[1].split(",")
    originalText = args.slice(2).join(" ")
  }
  languages = languages.slice(0, maxLanguageCount)

  const translation = await executeTranslations({ phrase: originalText, targetLangs: languages })
  
  const embed = new Discord.MessageEmbed()
    .setTitle("**Google Translatifier**")
    .setColor("#11be11")
    .addField("**Languages Passed Through**", "AUTO » " + languages.map(l => l.toUpperCase()).join(" » ") || "[none]")
    .addField("**Original**", trimString(originalText, maxOutputFieldLength) || "[none]", true)
    .addField("**Result**", trimString(translation, maxOutputFieldLength), true)
  msg.edit("", embed)
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, commandHelpEmbed } = index
    
  const embed = commandHelpEmbed(message, {
    title: "**Google Translate Command**",
    description: "Passes a phrase through Google translate several times.\nCustom languages can be ISO codes (e.g. `en`) or names (e.g. `english`).",
    syntax: `${config.main.prefix}google_translate [(-l|--languages) (lang1,[lang2,[...]])] <Phrase>`,
    example: [
      `**Use default languages:**`,
      ` ${config.main.prefix}google_translate Ducks are generally not considered amphibians as they do not have six legs.`,
      "",
      `**Custom languages (ISO):**`,
      ` ${config.main.prefix}google_translate -l nl,de,en Ducks are generally not considered amphibians as they do not have six legs.`,
      "",
      `**Custom languages (Names):**`,
      ` ${config.main.prefix}google_translate --languages dutch,german,english Ducks are generally not considered amphibians as they do not have six legs.`,
    ].join("\n"),
  })

  message.channel.send(embed)
}

exports.disabled = "oeuf"