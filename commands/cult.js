exports.run = async (client, message, args) => {
  const index = require("../index.js")
  const Discord = index.Discord
  
  let doc = db.collection("channels").doc("cult");
  let observer = doc.onSnapshot(docSnapshot => {
    console.log(`Cult channel change detected: ${docSnapshot._fieldsProto.id.stringValue}`)
    index.cultCache = docSnapshot._fieldsProto.id.stringValue
  }, err => {return})

  return message.channel.send(index.cultCache)
}