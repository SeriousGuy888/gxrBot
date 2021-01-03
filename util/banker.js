const index = require("../index.js")
const { client, firebaseAdmin, db } = index
let { balanceQueue } = index

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

  return balance
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

    const increment = firebaseAdmin.firestore.FieldValue.increment(balanceQueue[i]) // increment by net change
    const docRef = db.collection("users").doc(i)

    let payload = {
      balance: increment
    }
    await docRef.set(payload, { merge: true })


    delete balanceQueue[i]
  }
}