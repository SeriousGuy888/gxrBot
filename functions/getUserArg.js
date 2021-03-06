module.exports = async (message) => {
  const { client } = require("../index.js")
  const { commander } = client.util
  
  return await commander.getMentionArgs(commander.extractArgs(message).args, 0)
}