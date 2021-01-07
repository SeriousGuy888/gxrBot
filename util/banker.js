const index = require("../index.js")
const { client, firebaseAdmin, db } = index
const { increment } = firebaseAdmin.firestore.FieldValue
let { balanceQueue, inventoryQueue } = index

exports.getBalance = async userId => {
  const userRef = db.collection("users").doc(userId)
  const doc = await userRef.get()

  let balance = 0

  if(doc.exists) {
    let data = doc.data()

    if(data.balance) // if database record for user's balance exists
      balance = data.balance // read record and use as balance
    balance += balanceQueue[userId] ?? 0 // add on any pending changes to the balance
  }

  return balance.toFixed(2)
}

exports.addToBalance = async (userId, amount) => {
  const { logger } = client.util

  if(!balanceQueue[userId])
    balanceQueue[userId] = 0
  balanceQueue[userId] += amount

  logger.log(`Added ${amount} to balance of user ${userId}.`)
}

exports.updateBalances = async () => {
  const { logger } = client.util

  if(Object.keys(balanceQueue).length === 0)
    return
  
  logger.log(`Updating user balances...`)
  logger.log(JSON.stringify(balanceQueue, null, 4))

  for(let i in balanceQueue) {
    if(!balanceQueue[i]) {
      delete balanceQueue[i]
      continue // don't bother database if net change is zero
    }

    const docRef = db.collection("users").doc(i)

    let payload = {
      balance: increment(balanceQueue[i])
    }
    await docRef.set(payload, { merge: true })


    delete balanceQueue[i]
  }
}



exports.getInventory = async userId => {
  const userRef = db.collection("users").doc(userId)
  const doc = await userRef.get()

  let inventory = {}

  if(doc.exists) {
    let data = doc.data()

    if(data.inventory) // if database record for user's inventory exists
      inventory = data.inventory // read record and use as inventory
  }

  if(!inventoryQueue[userId])
    inventoryQueue[userId] = {}
  for(const item in inventoryQueue[userId]) {
    if(!inventory[item])
      inventory[item] = 0
    inventory[item] += inventoryQueue[userId][item]
  }
  for(const item in inventory) {
    if(!inventory[item]) // zero item amount
      delete inventory[item] // pretend the item doesnt exist
  }

  return inventory
}

exports.addToInventory = async (userId, item, amount) => {
  const { logger } = client.util
  if(!amount)
    amount = 1

  if(!inventoryQueue[userId])
    inventoryQueue[userId] = {}
  if(!inventoryQueue[userId][item])
    inventoryQueue[userId][item] = 0
  inventoryQueue[userId][item] += amount

  logger.log(`Added ${amount} of ${item} to inventory of user ${userId}.`)
}


exports.updateInventories = async () => {
  const { logger } = client.util

  if(Object.keys(inventoryQueue).length === 0)
    return
  
  logger.log(`Updating user inventories...`)
  logger.log(JSON.stringify(inventoryQueue, null, 4))

  const batch = db.batch()

  for(let user in inventoryQueue) {
    if(!Object.keys(inventoryQueue[user]).length) {
      delete inventoryQueue[user]
      continue
    }

    let payload = {
      inventory: {}
    }

    for(let item in inventoryQueue[user]) {
      if(!inventoryQueue[user][item]) // net change is zero
        continue // skip

      payload.inventory[item] = increment(inventoryQueue[user][item])
    }

    if(Object.keys(payload.inventory).length) { // inventory changes queued
      const docRef = db.collection("users").doc(user)
      // await .set(userPayload, { merge: true })
      batch.set(docRef, payload, { merge: true })
    }

    delete inventoryQueue[user]
  }
  
  await batch.commit()
}