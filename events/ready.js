module.exports = (client, message) => {
  const index = require("../index.js")

  console.log("g9lBot Loaded!")

  client.user.setPresence({ status: "online" })
  client.user.setActivity(`waiting...`, { type: "WATCHING" })

  setInterval(() => {
    const currentDate = new Date()
    const countdownDate = new Date("January 1 2021 00:00:00 GMT-0500") // new years eastern standard time

    const diffMillis = countdownDate - currentDate
    console.log(diffMillis)
    index.timeConvert(diffMillis).then(res => {
      client.user.setActivity(`${res.d} days remaining...`, { type: "WATCHING" })
    })
  }, 10 * 1000)

  setInterval(() => {
    index.propaganda()
  }, 5 * 60 * 1000)
}