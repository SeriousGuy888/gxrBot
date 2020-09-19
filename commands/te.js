exports.run = async (client, message, args) => {
  const embedder = client.util.get("embedder")

  let emb = embedManager.newEmbed()
    .setColor("#3333ee")
    .setTitle("lorem ipsum")
    .setDescription("dolor sit amet")
    .addField("abc")
  embedder.addBlankField(emb)
    .addField("def")
    
  message.channel.send(emb)
}