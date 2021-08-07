module.exports = {
  name: "say",
  description: "Specify a message for me to say!",
  options: [
    {
      type: "STRING",
      name: "content",
      description: "The content that will be echoed back.",
      required: true
    }
  ],
  defer: false,
  execute: async (interaction, options) => {
    const content = options.getString("content")
    await interaction.reply({ content: content.slice(0, 2000) })
  }
}