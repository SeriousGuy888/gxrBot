const { Discord } = require("../../index.js")

exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, db, timeConvert, commandCooldowns, QuickChart } = index
  const settings = config.karma


  let cooldown = 30 * 1000 // ms
  if(commandCooldowns.karma_graph[message.author.id]) {
    let cooldownRemaining = new Date() - commandCooldowns.karma_graph[message.author.id]
    if(cooldownRemaining < cooldown) {
      let cooldownRemainingHuman = await timeConvert(cooldownRemaining)
      message.channel.send(`Please stop killing my database.\nYou need to wait another \`${cooldown / 1000 - cooldownRemainingHuman.s} seconds\` before sending another query.`)
      return
    }
  }

  commandCooldowns.karma_graph[message.author.id] = new Date()

  
  const dataColl = db
    .collection("stats")
    .doc("karma_votes")
    .collection("dates")
  
  const snapshot = await dataColl
    .orderBy("timestamp", "desc")
    .limit(settings.graphs.limits.days)
    .get()
  
  
  let xAxisLabels = []
  let netVotesValue = []

  snapshot.forEach(doc => {
    xAxisLabels.push(doc.id)
    netVotesValue.push(doc.data().total)
  })


  const chart = new QuickChart()
    .setConfig({
      type: "line",
      data: {
        labels: xAxisLabels.reverse(),
        datasets: [
          {
            label: "Daily Net Karma Score of All Users",
            data: netVotesValue.reverse()
          }
        ]
      }
    })
    .setWidth(640)
    .setHeight(370)
    .setFormat("svg")
    .setBackgroundColor("#ffffff")

  const emb = new Discord.MessageEmbed()
    .setColor("#b3ac23")
    .setTitle(`Net Karma Score Change of All Users in the Last \`${settings.graphs.limits.days}\` Days`)
    .setImage(chart.getUrl())

  message.channel.send(emb)
}

exports.dev = true