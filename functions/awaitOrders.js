exports.run = () => {
  const index = require("../index.js")
  const { client, config, db, Discord } = index
  const logger = client.util.get("logger")



  const logOrder = async (type, content, permanent, effect, success) => {
    const channel = client.channels.cache.get("787414640018849853")
    if(!channel)
      return logger.log("Order logs channel does not exist.")
    
    

    const emb = new Discord.MessageEmbed()
      .setTitle(`Executed order of type \`${type}\``)
      .setDescription(content.slice(0, 1024))
      .addField("Effect", effect)
      .addField("Permanent Startup Order", permanent)
      .addField("Success", success, true)

    switch(success) {
      case true:
        emb.setColor("#23d523")
        break
      case null:
        emb.setColor("#d5d523")
        break
      default:
        emb.setColor("#d52323")
        break
    }

    channel.send(emb)
  }


  const processOrder = async (order, permanent) => {
    if(!order.type)
      return
    if(!order.content)
      return
    

    const { type, content } = order

    let success = null
    let effect = "Unspecified"

    switch(type) {
      case "eval":
        Function(content)()
        effect = "Evaled code"
        break
      case "log":
        logger.log(content, "db startup")
          .then(res => success = true)
          .catch(err => success = false)
        effect = "Logged message"
        break
      case "3":
        break
      default:
        logger.log(`Unknown order type \`${type}\`.`, "await orders")
        return
    }

    logOrder(type, content, permanent, effect, success)
  }



  const permanentOrdersDoc = db.collection("orders").doc("permanent")
  permanentOrdersDoc.onSnapshot(docSnapshot => {
    const data = docSnapshot.data()
    const orders = data.orders

    for(const order of orders)
      processOrder(order, true)
  })

  
  const instantOrdersDoc = db.collection("orders").doc("instant")
  instantOrdersDoc.update({ orders: [] })
    .then(logger.log("Successfully cleared instant orders.", "await orders"))

  instantOrdersDoc.onSnapshot(docSnapshot => {
    const data = docSnapshot.data()
    const orders = data.orders

    for(const order of orders)
      processOrder(order)
  })
}