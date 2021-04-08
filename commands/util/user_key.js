exports.run = async (client, message, args) => {
  const index = require("../../index.js")
  const { config, Discord } = index
  const { commander, embedder } = client.util

  const user = message.author


  const crypto = require("crypto")
  const algorithm = "aes-256-ctr"

  let key = process.env.USER_KEYS_SECRET
  if(args[0]) {
    key += `-${args.join(" ")}`
  }


  //https://attacomsian.com/blog/nodejs-encrypt-decrypt-data


}