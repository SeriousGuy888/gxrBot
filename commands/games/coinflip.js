exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const config = index.config
  const Discord = index.Discord

  const rimChance = 100

  const randomNumber = Math.floor(Math.random() * rimChance) + 1
  const rim = randomNumber === 1
  const flipResult = !!Math.round(Math.random())

  const attachment = new Discord.MessageAttachment(`./assets/coinflip/${rim ? "rim" : flipResult ? "heads" : "tails"}.png`, "coin.png")
  const emb = new Discord.MessageEmbed()
    .attachFiles(attachment)
    .setImage("attachment://coin.png")
    .setColor(config.main.colours.success)
    .setTitle(rim ? "Rim" : flipResult ? "Heads" : "Tails")
  if(rim) emb.setFooter(`The coin landed on the side. Wow, there's only a 1 in ${rimChance} chance of that :O.`)

  message.channel.send(emb)
}