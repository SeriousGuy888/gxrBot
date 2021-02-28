module.exports = async () => {
  const index = require("../index.js")
  const { client } = index
  const { karmanator } = client.util

  karmanator.update()
}