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
  execute: async (interaction, args) => {
    const [content] = args
    await interaction.followUp({ content: content.value.slice(0, 2000) })
  }
}