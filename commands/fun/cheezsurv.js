exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { axios, Discord } = index
  const { embedder } = client.util


  const responseData = (await axios.get("https://api.mcsrvstat.us/2/cheezsurv4.minehut.gg")).data


  const emb = new Discord.MessageEmbed()
  embedder.addAuthor(emb, message.author)
    .setColor("#ad23ad")
    .setTitle("CheezSurv4")


  const iconBase64 = responseData.icon
  const imageStream = Buffer.from(iconBase64?.split(",")[1], "base64")
  const attachment = new Discord.MessageAttachment(imageStream, "icon.png")

  emb
    .attachFiles(attachment)
    .setThumbnail("attachment://icon.png")
    .setDescription(responseData.motd.clean.join("\n") || "`No MOTD`")
    .addField("Players", `${responseData.players.online}/${responseData.players.max}`)
    .setFooter("graph coming soon????????")


  message.channel.send(emb)
}