module.exports = async (userId, amount, options) => {
  const index = require("../index.js")
  const { client } = index
  const { karmanator } = client.util

  
  karmanator.add(userId, amount, options)
}