const crypto = require("crypto")
const algorithm = "aes-256-ctr"
const secretKey = process.env.USER_KEYS_SECRET


// i have no idea if this is secure but its not like im using it for anything important

exports.encrypt = (text, customKey) => {
  const key = secretKey + "-" + customKey

  const iv = "g9lbot----------" // crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, Buffer.concat([Buffer.from(key), Buffer.alloc(32)], 32), iv)
  
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])

  return iv.toString("hex") + ":" + encrypted.toString("hex")
}

exports.decrypt = (text, customKey) => {
  const key = secretKey + "-" + customKey

  const textParts = text.split(":")
  const iv = Buffer.from(textParts.shift(), "hex")

  const encryptedText = Buffer.from(textParts.join(":"), "hex")
  
  const decipher = crypto.createDecipheriv(algorithm, Buffer.concat([Buffer.from(key), Buffer.alloc(32)], 32), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])

  return decrypted.toString()
}