export const formatMoney = (value?: number | string | null) => {
  if (!value) {
    return ''
  }
  const stringValue = `${value}`
  const arrayValue = stringValue.split('')
  const arrayValueLastIndex = arrayValue.length - 1
  let count = 0
  const arrayResult: string[] = []
  for (let index = arrayValueLastIndex; index >= 0; index--) {
    count += 1
    if (count === 4) {
      arrayResult.unshift('.')
      count = 1
    }
    const numberValue = arrayValue[index]
    arrayResult.unshift(numberValue)
  }

  return arrayResult.join('')
}
