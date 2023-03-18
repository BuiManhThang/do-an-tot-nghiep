export const validateEmail = (inputValue: string) => {
  if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(inputValue)) {
    return false
  }
  return true
}

export const validateRequire = (inputValue: any) => {
  if (!inputValue) {
    return false
  }
  if (typeof inputValue === 'string') {
    if (inputValue.trim() === '') {
      return false
    }
  }
  if (Array.isArray(inputValue)) {
    if (inputValue.length === 0) {
      return false
    }
  }
  return true
}

export const validatePhoneNumber = (inputValue: string) => {
  if (!/[0-9]{10}/.test(inputValue)) {
    return false
  }
  return true
}

export const validatePassword = (inputValue: string) => {
  if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,32}$/.test(inputValue)) {
    return false
  }
  return true
}
