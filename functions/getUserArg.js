module.exports = async (message) => {
  const { client } = require("../index.js")
  const { commander } = client.util
  
  return await commander.getMentionArgs(message, 0)
}