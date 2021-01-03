exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, banker, messenger } = index
  
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
  if(!amount) {
    message.channel.send("number please you dukcing stupid")
    return
  }

  if(amount <= 0) {
    message.channel.send("you cant just pay people negative or zero amounts you dukcing dukc")
    return
  }

  let balance = await banker.getBalance(message.author.id)
  if(balance < amount) {
    message.channel.send(`you only have :coin:${balance}`)
    return
  }


  
  const msg = await messenger.loadingMessage(message.channel, {
    title: `Paying ${member.tag} :coin:${amount}`
  })


  banker.addToBalance(member.id, amount)
  banker.addToBalance(message.author.id, -amount)

  const responseEmbed = new Discord.MessageEmbed()
    .setTitle(`:white_check_mark: Payment Successful`)
    .setDescription(`Paid :coin:${amount} to ${member.tag}.`)

  msg.edit(responseEmbed)
}

exports.help = async (client, message, args) => {
  message.channel.send("pay people")
}

exports.cooldown = 5