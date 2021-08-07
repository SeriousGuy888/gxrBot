module.exports = {
  name: "say",
  description: "Specify a message for me to say!",
  options: [
    {
      type: "STRING",
      name: "content",
      description: "The content that will be echoed back.",
      required: true
    },
    {
      type: "BOOLEAN",
      name: "anonymous",
      description: "The output will not show that you made me say this."
    }
  ],
  defer: false,
  execute: async (interaction, options) => {
    const content = options.getString("content").slice(0, 2000)
    const anonymous = !!options.getBoolean("anonymous")

    if(anonymous) {
      await interaction.channel.send({ content })
    }
    else {
      await interaction.reply({ content })
    }
  }
}