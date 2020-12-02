exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { firebaseAdmin, db, config } = index

  if(!message.author.id === config.admins.superadmin.id)
    return message.channel.send("dev command")

    
  const increment = firebaseAdmin.firestore.FieldValue.increment(1)
  const docRef = db.collection("users").doc(message.author.id)

  await docRef.set({
    karma: increment
  }, { merge: true })
}

exports.dev = true
exports.disabled = "dev command"