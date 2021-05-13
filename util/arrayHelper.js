exports.moveArrayItem = (array, fromIndex, toIndex) => {
  const arr = [...array]
  arr.splice(toIndex, 0, ...arr.splice(fromIndex, 1))
  return arr
}