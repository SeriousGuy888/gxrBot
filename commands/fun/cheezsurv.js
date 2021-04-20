exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, QuickChart } = index
  const { embedder, minecraftPinger } = client.util

  const responseData = await minecraftPinger.pingMinehut("cheezsurv4")


  const emb = new Discord.MessageEmbed()
  embedder.addAuthor(emb, message.author)
    .setColor("#ad23ad")
    .setTitle(`CheezSurv4 \`${responseData?.online ? "🟢 Online" : "🔴 Offline"}\``)
    .setFooter("graph coming now????????")



  let allStats = await minecraftPinger.getTrackedData("cheezsurv4", 2)

  const insertColonAtPos2 = str => str.slice(0, 2) + ":" + str.slice(2, str.length)

  const xAxisLabels = Object.keys(allStats).map(e => insertColonAtPos2(e.split("_")[1] === "0000" ? e.split("_")[0] : e.split("_")[1]))
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
                max: Math.max(topOnlinePlayerCount, 10),
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