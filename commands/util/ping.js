exports.run = async (client, message, args) => {
  message.channel.send({ content: "This command has been moved into a slash command. Please use the slash command `/ping`." })
}