exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const Discord = index.Discord

  const rimChance = 100

  const randomNumber = Math.floor(Math.random() * rimChance) + 1
  const rim = randomNumber === 1
  const flipResult = !!Math.round(Math.random())

  const attachment = new Discord.MessageAttachment(`./assets/coinflip/${rim ? "rim" : flipResult ? "heads" : "tails"}.png`, "coin.png")
  const emb = new Discord.MessageEmbed()
    .attachFiles(attachment)
    .setImage("attachment://coin.png")
    .setColor("#a2a212")
    .setTitle(rim ? "Rim" : flipResult ? "Heads" : "Tails")
  if(rim) emb.setFooter(`The coin landed on the side. Wow, there's only a 1 in ${rimChance} chance of that :O.`)

  message.channel.send(emb)
}