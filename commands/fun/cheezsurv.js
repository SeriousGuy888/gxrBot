exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { db, Discord, QuickChart } = index
  const { embedder, minecraftPinger } = client.util

  const cache = require("../../cache.js")
  const minecraftTrackCache = cache.minecraftTrack


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
    .orderBy("timestamp", "asc")
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

  let cachedPayload = minecraftTrackCache?.cheezsurv4?.[minecraftPinger.getIsoDate()]?.payload
  for(const timeField in cachedPayload) {
    if(timeField === "timestamp") continue
    allStats[`${minecraftPinger.getIsoDate()}_${timeField}`] = cachedPayload[timeField]
  }

  const insertColonAtPos2 = str => str.slice(0, 2) + ":" + str.slice(2, str.length)

  const xAxisLabels = Object.keys(allStats).map(e => insertColonAtPos2(e.split("_")[1]))
  const playersOnlineDataset = Object.values(allStats).map(e => e.playerCount)
  const topOnlinePlayerCount = Math.max(...playersOnlineDataset)

  const chart = new QuickChart()
    .setConfig({
      type: "line",
      data: {
        labels: xAxisLabels,
        datasets: [
          {
            label: "Players Online",
            data: playersOnlineDataset,
            fill: true,
            borderColor: "#c94b42",
            backgroundColor: '#e85d5480'
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: "Players Online [All times in UTC]"
        },
        scales: {
          yAxes: [
            {
              ticks: {
                min: 0,
                max: Math.max(topOnlinePlayerCount, 16),
                stepSize: 1
              }
            }
          ]
        },
        plugins: {
          legend: false,
          datalabels: {
            display: false,
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