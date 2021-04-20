exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord } = index
  const { embedder, minecraftPinger } = client.util


  const responseData = await minecraftPinger.pingMinehut("cheezsurv4")


  const emb = new Discord.MessageEmbed()
  embedder.addAuthor(emb, message.author)
    .setColor("#ad23ad")
    .setTitle("CheezSurv4")
    .setFooter("graph coming soon????????")


  // let attachment
  // const iconBase64 = responseData.icon
  // if(iconBase64) {
  //   const imageStream = Buffer.from(iconBase64.split(",")[1], "base64")
  //   attachment = new Discord.MessageAttachment(imageStream, "icon.png")
  // }
  // if(attachment) {
  //   emb
  //     .attachFiles(attachment)
  //     .setThumbnail("attachment://icon.png")
  // }

  if(responseData) {
    emb
      .setDescription(responseData.motd || "`No MOTD`")
      .addField("Players", `${responseData.playerCount}/${responseData.maxPlayers}`)
  }
  else {
    emb.setDescription("minehut's api is dukcing deceased lol")
  }


  message.channel.send(emb)
}