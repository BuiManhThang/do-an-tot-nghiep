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

export const convertDate = (
  value: string | Date | undefined | null,
  formas: string = 'dd/MM/yyyy'
) => {
  if (!value) {
    return ''
  }

  let date = value
  if (typeof value === 'string') {
    date = new Date(value)
  }
  if (!(date instanceof Date)) {
    return ''
  }

  const d = date.getDate()
  const m = date.getMonth() + 1
  const y = date.getFullYear()

  formas = formas.replace('dd', d < 10 ? `0${d}` : `${d}`)
  formas = formas.replace('MM', m < 10 ? `0${m}` : `${m}`)
  formas = formas.replace('yyyy', `${y}`)
  return formas
}

export const numberWithCommas = (number: number | string | null | undefined) => {
  if (!number) {
    return ''
  }
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
