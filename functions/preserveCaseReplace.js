module.exports = (original, replaceWith, duckDiacritics) => {
  let sanitised = original
  if(duckDiacritics) {
    sanitised = original
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  }
  
  if(!replaceWith) return

  let result = ""
  let letterRatio = sanitised.length / replaceWith.length
  for(let i = 0; i < replaceWith.length; i++) {
    let replacementChar = replaceWith.charAt(i)
    let originalChar = sanitised.charAt(Math.floor(i * letterRatio))

    if(originalChar.match(/[A-Z]/)) result += replacementChar.toUpperCase()
    else                            result += replacementChar.toLowerCase()
  }
  
  if(duckDiacritics) {
    result = result
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  }
    

  return result
}