exports.run = async (client, message, args) => {
  const embedder = client.util.get("embedder")
  const messenger = client.util.get("messenger")

  let emb = embedder.newEmbed()
    .setColor("#3333ee")
    .setTitle("lorem ipsum")
    .setDescription("dolor sit amet")
    .addField("abc")
  embedder.addBlankField(emb)
    .addField("def")
    
  messenger.dm(message.author.id, "a")
}

exports.dev = true
exports.disabled = "dev command"