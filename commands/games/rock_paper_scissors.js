exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  if(!args[0])
    return this.help(client, message, args)

  const randomNumber = Math.floor(Math.random() * rimChance) + 1
  const rim = randomNumber === 1
  const flipResult = !!Math.round(Math.random())

  // const attachment = new Discord.MessageAttachment(`./assets/coinflip/${rim ? "rim" : flipResult ? "heads" : "tails"}.png`, "coin.png")
  const emb = new Discord.MessageEmbed()
    // .attachFiles(attachment)
    // .setImage("attachment://coin.png")
    .setColor(config.main.colours.success)
    .setTitle(rim ? "Rim" : flipResult ? "Heads" : "Tails")
  if(rim) emb.setFooter(`The coin landed on the side. Wow, there's only a 1 in ${rimChance} chance of that :O.`)

  message.channel.send(emb)
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  // const { settings } = config.hangman
  const Discord = index.Discord

  const embed = new Discord.MessageEmbed()
    .setAuthor(message.author.tag, message.author.avatarURL())
    .setTitle("**Rock Paper Scissors**")
    .setColor(config.main.colours.help)
    .setDescription("Play a game of stone tree corpse double knife!")
    .addField("Syntax", `${config.main.prefix}rock_paper_scissors <r[ock] | p[aper] | s[cissors]>`)
    .addField("\u200b", "\u200b")
    .addField("Examples", [
      `**Play**`,
      ` ${config.main.prefix}rock_paper_scissors paper`,
    ].join("\n"))
  message.channel.send(embed)
}

exports.disabled = "currently work in progress"