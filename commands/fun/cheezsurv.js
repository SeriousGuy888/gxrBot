exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { db, Discord, QuickChart } = index
  const { embedder, minecraftPinger } = client.util


  const responseData = await minecraftPinger.pingMinehut("cheezsurv4")


  const emb = new Discord.MessageEmbed()
  embedder.addAuthor(emb, message.author)
    .setColor("#ad23ad")
    .setTitle(`CheezSurv4 \`${responseData?.online ? "🟢 Online" : "🔴 Offline"}\``)
    .setFooter("graph coming now????????")


  const collRef = db
    .collection("stats")
    .doc("minecraft_track")
    .collection("cheezsurv4")
  const snapshot = await collRef
    .orderBy("timestamp", "desc")
    .limit(2)
    .get()

  let allStats = {}

  snapshot.forEach(async doc => {
    const data = doc.data()
    for(const timeField in data) {
      if(timeField === "timestamp") continue
      allStats[`${doc.id}_${timeField}`] = data[timeField]
    }
  })

  const xAxisLabels = Object.keys(allStats)
  const playersOnlineDataset = Object.values(allStats).map(e => e.players.online)

  const chart = new QuickChart()
    .setConfig({
      type: "line",
      data: {
        labels: xAxisLabels,
        datasets: [
          {
            label: "Players Online",
            data: playersOnlineDataset,
            fill: false,
            borderColor: "#b4eb34",
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: "Players Online [All times in UTC]"
        },
        plugins: {
          legend: false,
          datalabels: {
            display: true,
            align: "right",
            backgroundColor: "#cdcdcd",
            borderRadius: 3
          }
        }
      }
    })
    .setWidth(640)
    .setHeight(370)
    .setFormat("webp")
    .setBackgroundColor("#ffffff")
  emb.setImage(chart.getUrl())

  if(responseData) {
    emb
      .setDescription(responseData.motd.replace(/§[0-9a-fk-o]/gim, "") || "`No MOTD`")
      .addField("Players", `${responseData.playerCount}/${responseData.maxPlayers}`, true)
      .addField("Current Server Plan", `\`${responseData.server_plan}\``, true)
    embedder.addBlankField(emb)
      .addField(`Plugins (${responseData.plugins.length})`, responseData.plugins.join("\n").slice(0, 1024))
  }
  else {
    emb.setDescription("minehut's api is dukcing deceased lol")
  }


  message.channel.send(emb)
}