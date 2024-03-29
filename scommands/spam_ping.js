const index = require("../index.js")
const { client, config, Discord } = index
const { messenger } = client.util

module.exports = {
  name: "spam_ping",
  description: "annoy someone you hate (or love)",
  options: [
    {
      type: "USER",
      name: "user",
      description: "The person you want to ping.",
      required: true,
    },
    {
      type: "INTEGER",
      name: "times",
      description: "How many times you want to ping this person.",
      required: true,
    },
    {
      type: "BOOLEAN",
      name: "ghost_ping",
      description: "Delete mentions after sending for ghost ping?",
    },
    {
      type: "STRING",
      name: "custom_message",
      description: "Any custom message you want to be sent with the ping?",
    },
  ],
  defer: false,
  cooldown: 60,
  execute: async (interaction, options) => {
    const user = options.getUser("user")
    const times = Math.max(Math.min(options.getInteger("times"), 25), 1)
    const ghostPing = !!options.getBoolean("ghost_ping")
    const customMessage = options.getString("custom_message")?.slice(0, 500) || "get pinged lol"
  
    const responseEmbed = new Discord.MessageEmbed()
      .setColor(config.main.colours.success)
      .setTitle(ghostPing ? "Ghost-Pinger" : "Spam-Pinger")
      .setDescription(`Pinging ${user} ${times} times.`)
  
    interaction.reply({ embeds: [responseEmbed], ephemeral: ghostPing })
  
  
  
    const delay = require("util").promisify(setTimeout)
  
  
    const ping = async (w, str) => {
      w.send({
        content: str,
        username: ghostPing ? "Ghost-Pinger" : "Spam-Pinger",
        avatarURL: client.user.avatarURL(),
      }).then(m => {
        if(ghostPing) m.delete()
      }).catch(error => interaction.followUp(error))
    }
  
    const hookName = "Spam-Pinger"
  
    const webhooks = await interaction.channel.fetchWebhooks()
    let webhook = webhooks.find(w => w.name.includes(hookName) && w.owner.id === client.user.id)
    if(!webhook) webhook = await interaction.channel.createWebhook(hookName, { avatar: client.user.avatarURL() })
  
  
    for(let i = 0; i < times; i++) {
      await ping(webhook, `${user}, ${customMessage} (From ${interaction.user.tag} \`${i + 1}/${times}\`)`)
      await delay(1500)
    }
  }
}