exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config } = index
  const { getUserArg } = client.functions
  const { embedder, logger, messenger } = client.util
  
  let user = await getUserArg(message)
  let times = Math.max(Math.min(parseInt(args[1]), 25), 1) || 5

  const ghostPing = !!args.slice(args.length - 1).join(" ").match(/--ghost|-g/gi)
  if(ghostPing)
    args.splice(args.length - 1, 1)

  let customMessage = args[2] ? args.slice(2).join(" ").slice(0, 500) : "get pinged lol"

  const responseEmbed = new Discord.MessageEmbed()
    .setColor(config.main.colours.success)
    .setTitle(ghostPing ? "Ghost-Pinger" : "Spam-Pinger")
    .setDescription(`Pinging ${user} ${times} times.\nAdd \`-g\` or \`--ghost-ping\` to the end to ghost ping.`)
  embedder.addAuthor(responseEmbed, message.author, "Courtesy of %tag%")

  if(ghostPing)
    messenger.dm(message.author.id, responseEmbed)
  else
    message.channel.send(responseEmbed)

  logger.log(`${message.author.id} pinged ${user.id} ${times} times${ghostPing ? " with -g flag" : ""} in ${message.channel.id}.`)




  const delay = ms => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(2)
      }, ms)
    })
  }


  const ping = async (w, str) => {
    w.send(str, {
      "username": ghostPing ? "Ghost-Pinger" : "Spam-Pinger",
      "avatarURL": client.user.avatarURL(),
    }).then(m => {
      if(ghostPing)
        m.delete()
    }).catch(error => message.channel.send(error))
  }

  const hookName = "Spam-Pinger"

  const webhooks = await message.channel.fetchWebhooks()
  let webhook = webhooks.find(w => w.name.includes(hookName) && w.owner.id === client.user.id)
  if(!webhook)
    webhook = await message.channel.createWebhook(hookName, { avatar: client.user.avatarURL() })


  for(let i = 0; i < times; i++) {
    await ping(webhook, `${user}, ${customMessage} (From ${message.author.tag} \`${i + 1}/${times}\`)`)
    await delay(1500)
  }
}

exports.cooldown = 60