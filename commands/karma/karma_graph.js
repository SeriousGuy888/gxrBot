exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, db, Discord, QuickChart, graphCache, messenger } = index
  const settings = config.karma
  
  
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.karma,
    title: "Getting Karma Graph..."
  })

  let dayCount = Math.abs(parseInt(args[0]))
  if(!dayCount || dayCount > settings.graphs.limits.days)
    dayCount = settings.graphs.defaults.days



  let { karmaChange } = graphCache
  let { cache } = karmaChange
  let xAxisLabels = []
  let netVotesValue = []
  let readFromDatabase = false

  if(!karmaChange.complete && Object.keys(cache).length < dayCount) {
    karmaChange.complete = false
    for(let i in cache)
      delete cache[i]

    readFromDatabase = true



    const dataColl = db
      .collection("stats")
      .doc("karma_votes")
      .collection("dates")
    
    const snapshot = await dataColl
      .orderBy("timestamp", "desc")
      .limit(dayCount)
      .get()
  
    if(snapshot.size < dayCount)    // if there are not enough database entries to fill requested day count
      karmaChange.complete = true   // instruct that the database not be queried again
    snapshot.forEach(doc => {
      cache.push({
        date: doc.id,
        data: doc.data()
      })
    })
  }

  for(const entry of cache) {
    if(!entry)
      continue
    xAxisLabels.push(entry.date)
    netVotesValue.push(entry.data.total)
  }


  const chart = new QuickChart()
    .setConfig({
      type: "line",
      data: {
        labels: xAxisLabels.reverse(),
        datasets: [
          {
            label: "Daily Net Karma Score of All Users",
            data: netVotesValue.reverse(),
            fill: false,
            borderColor: "#a323e3",
          }
        ]
      },
      options: {
        title: {
          display: true,
          text: ""
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

  const emb = new Discord.MessageEmbed()
    .setColor("#b3ac23")
    .setTitle(`Net Karma Score Change of All Users in the Last \`${dayCount}\` Days`)
    .setImage(chart.getUrl())
    .setFooter(readFromDatabase ? "✅ All data is up to date." : "⚠ Data read from cache; recent data may be outdated.")

  msg.edit(emb)
}

exports.help = async (client, message, args) => {
  const index = require("../../index.js")
  const { prefix } = index

  message.channel.send(`Syntax: \`${prefix}karma_graph [Amount of Days]\``)
}