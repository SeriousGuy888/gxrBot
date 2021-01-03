exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, banker, messenger } = index
  const settings = config.economy
  
  if(!args[0]) {
    this.help(client, message, args)
    return
  }

  let member = message.mentions.members.first() || await message.guild.members.fetch(args[0])
  if(member.user)
    member = member.user

  if(member.id === message.author.id) {
    message.channel.send("you cant pay yourself dumbadd")
    return
  }
  

  let amount = parseFloat(parseFloat(args[1]).toFixed(2)) // parse amount as float with 2 decimal points of accuracy
  if(!amount)
    return message.channel.send("at least `0.01` you dukcing dukc")

  if(amount <= 0)
    return message.channel.send("you cant just pay people negative amounts you dukcing dukc")

  let balance = await banker.getBalance(message.author.id)
  if(balance < amount)
    return message.channel.send(`you only have ${settings.lang.emojis.coin}${balance}`)


  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.generic,
    title: `Paying ${member.tag} ${settings.lang.emojis.coin}${amount}`
  })

  const waitingEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.generic)
    .setTitle("Confirm Transaction")
    .setDescription(`${message.author} pays ${member} ${settings.lang.emojis.coin}${amount}\nReact with ${settings.lang.emojis.confirm} to confirm.`)
  await msg.edit(waitingEmbed)
  msg.react(settings.lang.emojis.confirm)
  const filter = (reaction, reactor) => (reaction.emoji.name === settings.lang.emojis.confirm) && (reactor.id === message.author.id)
  msg.awaitReactions(filter, { max: 1, time: 15000 })
    .then(collected => {
      const reaction = collected.first()
      if(reaction.emoji.name === settings.lang.emojis.confirm) {
        banker.addToBalance(member.id, amount)
        banker.addToBalance(message.author.id, -amount)
      
        const responseEmbed = new Discord.MessageEmbed()
          .setColor(settings.colours.generic)
          .setTitle(`:white_check_mark: Payment Successful`)
          .setDescription(`Paid ${settings.lang.emojis.coin}${amount} to ${member}.`)
      
        msg.edit(responseEmbed)
      }
      else {
        message.channel.send("everything is broken duckduck dukcdu uckd")
      }
    })
    .catch(collected => {
      waitingEmbed.setColor(settings.colours.failure)
      msg.edit("Transaction was aborted because no confirmation was received. How rude.", {
        embed: waitingEmbed
      })
    })
}

exports.help = async (client, message, args) => {
  message.channel.send("pay people")
}

exports.cooldown = 5