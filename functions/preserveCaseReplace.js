module.exports = (original, replaceRegex, replaceWith, duckDiacritics) => {
  let replacementResult = original
  let diacriticsRemoved = duckDiacritics ? original.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : original
  let occurences = diacriticsRemoved.match(replaceRegex)
  
  for(let i in occurences) {
    let resWithPreservedCase = ""
    let letterRatio = occurences[i].length / replaceWith.length
    for(let j = 0; j < replaceWith.length; j++) {
      let censorChar = replaceWith.charAt(j)
      let originalChar = occurences[i].charAt(Math.floor(j * letterRatio))

      if(originalChar.match(/[A-Z]/)) resWithPreservedCase += censorChar.toUpperCase()
      else                            resWithPreservedCase += censorChar.toLowerCase()
    }
    
    if(duckDiacritics) {
      replacementResult = replacementResult
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    }
    replacementResult = replacementResult.replace(occurences[i], resWithPreservedCase)
  }
  return replacementResult
}