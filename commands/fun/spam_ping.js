exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, getUserArg, embedder, messenger } = index
  
  let user = await getUserArg(message)
  let times = Math.max(Math.min(parseInt(args[1]), 25), 1) || 5

  const responseEmbed = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setTitle("Spam Pinger")
    .setDescription(`Spam-pinging ${user} ${times} times`)
  embedder.addAuthor(responseEmbed, message.author, "Courtesy of %tag%")

  message.channel.send(responseEmbed)




  const delay = ms => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(2)
      }, ms)
    })
  }


  const ping = (w, str) => {
    w.send(str, {
      "username": "Spam-Pinger",
      "avatarURL": client.user.avatarURL(),
    }).catch(error => message.channel.send(error))
  }

  const hookName = "Spam-Pinger"

  const webhooks = await message.channel.fetchWebhooks()
  let webhook = webhooks.find(w => w.name.includes(hookName) && w.owner.id === client.user.id)
  if(!webhook)
    webhook = await message.channel.createWebhook(hookName, { avatar: client.user.avatarURL() })


  for(let i = 0; i < times; i++) {
    await ping(webhook, `${user}, Spam-pinging courtesy of ${message.author.tag}. (${i + 1}/${times})`)
    await delay(1250)
  }
}

exports.cooldown = 60