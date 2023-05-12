export const numberWithCommas = (number: number | string | null | undefined) => {
  if (!number) {
    return ''
  }
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
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
  formas = formas.replace('yyyy', y < 10000 ? `${y}`.padStart(4, '0') : `${y}`)
  return formas
}
