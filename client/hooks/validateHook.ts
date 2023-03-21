import { useState } from 'react'
import {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateRequire,
} from '@/common/validate'

export enum ValidateRule {
  Required = 'Required',
  Email = 'Email',
  Password = 'Password',
  PhoneNumber = 'PhoneNumber',
  Custom = 'Custom',
}

export type Validator = {
  field: string
  name: string
  rules: ValidateRule[]
  custom?: (value: any, field: string, name: string, rules: ValidateRule[]) => string
}

const validateElement = (data: any, validator: Validator): string => {
  const { field, name, rules, custom } = validator
  const dataControl = data[field]
  if (!dataControl) {
    return `${name} không được để trống`
  }

  for (let indexRule = 0; indexRule < rules.length; indexRule++) {
    const rule = rules[indexRule]
    switch (rule) {
      case ValidateRule.Required:
        if (!validateRequire(dataControl)) {
          return `${name} không được để trống`
        }
        break
      case ValidateRule.Email:
        if (!validateEmail(dataControl)) {
          return `${name} sai định dạng email`
        }
        break
      case ValidateRule.PhoneNumber:
        if (!validatePhoneNumber(dataControl)) {
          return `${name} sai định dạng số điện thoại`
        }
        break
      case ValidateRule.Password:
        if (!validatePassword(dataControl)) {
          return `${name} cần từ 8 đến 32 ký tự bao gồm chữ, số, chữ in hoa`
        }
        break
      case ValidateRule.Custom:
        if (typeof custom !== 'function') {
          break
        }
        const customMsg = custom(dataControl, field, name, rules)
        console.log(customMsg)
        if (customMsg) {
          return customMsg
        }
        break
      default:
        break
    }
  }
  return ''
}

export const useValidate = (validators: Validator[]) => {
  const [error, setError] = useState<any>({})
  const [isValidated, setIsValidated] = useState<boolean>(false)

  const validate = (data: any): boolean => {
    setIsValidated(true)
    if (!validators.length) {
      return true
    }
    const validateResult: any = {}
    let isValid = true
    const validatorsLength = validators.length
    for (let index = 0; index < validatorsLength; index++) {
      const validator = validators[index]
      const errorMsg = validateElement(data, validator)
      if (errorMsg) {
        validateResult[validator.field] = errorMsg
        isValid = false
      }
    }

    setError(validateResult)
    return isValid
  }

  return {
    error,
    isValidated,
    validate,
    setError,
  }
}
