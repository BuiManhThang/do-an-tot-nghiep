export const numberWithCommas = (number: number | string | null | undefined) => {
  if (!number) {
    return ''
  }
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
