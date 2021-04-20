exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord } = index
  const { embedder, minecraftPinger } = client.util


  const responseData = await minecraftPinger.ping("cheezsurv4.minehut.gg")

  const emb = new Discord.MessageEmbed()
  embedder.addAuthor(emb, message.author)
    .setColor("#ad23ad")
    .setTitle("CheezSurv4")
    .setFooter("graph coming soon????????")


  let attachment
  const iconBase64 = responseData.icon
  if(iconBase64) {
    const imageStream = Buffer.from(iconBase64.split(",")[1], "base64")
    attachment = new Discord.MessageAttachment(imageStream, "icon.png")
  }
  if(attachment) {
    emb
      .attachFiles(attachment)
      .setThumbnail("attachment://icon.png")
  }

  if(responseData.online) {
    emb
      .setDescription(responseData.motd.clean.join("\n") || "`No MOTD`")
      .addField("Players", `${responseData.players.online}/${responseData.players.max}`)
  }
  else {
    emb.setDescription("minehut's dukcing deceased lol")
  }


  message.channel.send(emb)
}