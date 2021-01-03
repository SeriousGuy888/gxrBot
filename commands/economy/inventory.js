exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { Discord, config, banker, messenger } = index
  const settings = config.economy
  
  let member
  if(!args[0])
    member = message.author
  else
    member = message.mentions.members.first() || await message.guild.members.fetch(args[0])
  if(member.user)
    member = member.user
  
  
  const msg = await messenger.loadingMessage(message.channel, {
    colour: settings.colours.generic,
    title: `Querying Inventory of ${member.tag}`
  })


  const responseEmbed = new Discord.MessageEmbed()
    .setColor(settings.colours.generic)
    .setTitle(`Inventory of ${member.tag}`)

  const inventory = await banker.getInventory(member.id)
  if(Object.keys(inventory).length) {
    for(const item in inventory) {
      responseEmbed.addField(item, inventory[item])
    }
  }
  else {
    responseEmbed.setDescription("This user does not have anything in their inventory.")
  }

  msg.edit(responseEmbed)
}

exports.cooldown = 10