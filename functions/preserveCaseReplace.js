/*
  https://en.wikipedia.org/wiki/Private_Use_Areas
  
  Unassigned Unicode characters are used to temporarily denote
  the places which need to be replaced so that the same place
  is not replaced twice.
*/

module.exports = (original, replaceRegex, replaceWith, duckDiacritics) => {
  let replacementResult = original
  let diacriticsRemoved = duckDiacritics ? original.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : original
  let occurences = diacriticsRemoved.match(replaceRegex)
  
  let replacementKey = {}

  for(let i in occurences) {
    let replacedOccurence = ""
    let letterRatio = occurences[i].length / replaceWith.length

    for(let j = 0; j < replaceWith.length; j++) {
      let censorChar = replaceWith.charAt(j)
      let originalChar = occurences[i].charAt(Math.floor(j * letterRatio))

      if(originalChar.match(/[A-Z]/)) replacedOccurence += censorChar.toUpperCase()
      else                            replacedOccurence += censorChar.toLowerCase()
    }
    
    if(duckDiacritics) {
      replacementResult = replacementResult
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    }

    
    const charCode = 0xe000 + i
    const char = String.fromCharCode(charCode)

    replacementKey[char] = replacedOccurence
    replacementResult = replacementResult.replace(occurences[i], char)
  }

  for(let char in replacementKey) {
    replacementResult = replacementResult.replace(char, replacementKey[char])
  }

  return replacementResult
}