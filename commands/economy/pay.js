exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, getUserArg, banker, embedder, messenger } = index
  const settings = config.economy
  
  if(!args[0]) {
    this.help(client, message, args)
    return
  }

  let user = await getUserArg(message)
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.generic,
    title: `Beginning Transaction...`
  })

  const updateWithError = errorMessage => {
    const emb = msg.embeds[0]
      .setColor(config.main.colours.error)
      .setTitle("Transaction Failed")
      .setDescription(errorMessage)
    
    embedder.addAuthor(emb, message.author)

    msg.edit(emb)
  }


  if(user.id === message.author.id)
    return updateWithError("Specify a valid user who is not yourself.")

  let amount = parseFloat(parseFloat(args[1]).toFixed(2)) // parse amount as float with 2 decimal points of accuracy
  let balance = await banker.getBalance(message.author.id)

  if(!amount || amount <= 0)
    return updateWithError(`The payment must be at least ${settings.lang.emojis.coin}0.01 you dukcing dukc.`)
  if(balance < amount)
    return updateWithError(`You only have ${settings.lang.emojis.coin}${balance}.`)
  

  const confirmEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.generic)
    .setTitle("Confirm Transaction")
    .setDescription(`${message.author} pays ${user} ${settings.lang.emojis.coin}${amount}\nReact with ${settings.lang.emojis.confirm} to confirm.`)
  await msg.edit(confirmEmbed)
  msg.react(settings.lang.emojis.confirm)
  const filter = (reaction, reactor) => (reaction.emoji.name === settings.lang.emojis.confirm) && (reactor.id === message.author.id)
  msg.awaitReactions(filter, { max: 1, time: 15000 })
    .then(collected => {
      const reaction = collected.first()
      if(reaction.emoji.name === settings.lang.emojis.confirm) {
        banker.addToBalance(user.id, amount)
        banker.addToBalance(message.author.id, -amount)
      
        const responseEmbed = new Discord.MessageEmbed()
          .setColor(settings.colours.generic)
          .setTitle(`${config.main.emojis.check} Transaction Complete`)
          .setDescription(`${message.author} has paid ${user} ${settings.lang.emojis.coin}${amount}.`)
      
        msg.edit(responseEmbed)
      }
      else {
        message.channel.send("everything is broken duckduck dukcdu uckd")
      }
    })
    .catch(collected => {
      confirmEmbed.setColor(settings.colours.failure)
      msg.edit("Transaction was aborted because no confirmation was received. How rude.", {
        embed: confirmEmbed
      })
    })
}

exports.help = async (client, message, args) => {
  message.channel.send("pay people")
}

exports.cooldown = 5