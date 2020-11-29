module.exports = (client, message) => {
  const index = require("../index.js")
  const schedule = index.schedule

  console.log("g9lBot Loaded!")

  client.user.setPresence({ status: "online" })
  client.user.setActivity(`waiting...`, { type: "WATCHING" })


  const timeUntilNewYear = async () => {
    const currentDate = new Date()
    const countdownDate = new Date("January 1 2021 00:00:00 GMT-0500") // new years eastern standard time
    const diffMillis = countdownDate - currentDate
    const res = await index.timeConvert(diffMillis)
    return res
  }

  setInterval(() => {
    timeUntilNewYear().then(res => client.user.setActivity(`${res.d} days remaining...`, { type: "WATCHING" }))
  }, 10 * 1000)

  schedule.scheduleJob("0 0 0 * * *", () => {
    const newsChannel = client.channels.cache.get("749428233270853681")
    if(!newsChannel)
      return console.log("Error - news channel does not exist D:")
    
    timeUntilNewYear().then(res => {
      newsChannel.send(`2020 ends in ${res.d} days :D *hoping this line of code actually fires at the correct time*`)
    })
  })

  setInterval(() => {
    index.propaganda()
  }, 5 * 60 * 1000)
}