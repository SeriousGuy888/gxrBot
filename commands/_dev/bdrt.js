exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config } = index
  const birthdays = config.birthdays

  const month = parseInt(args[0] || 1)
  const day = parseInt(args[1] || 1)

  const todaysBirthdays = []
  for(const name in birthdays) {
    if(birthdays[name] === `${month}-${day}`) {
      todaysBirthdays.push(name)
    }
  }

  message.channel.send({ content: `${month}-${day}\nbirthdays: ${todaysBirthdays.join(", ")}` })
}

exports.dev = true