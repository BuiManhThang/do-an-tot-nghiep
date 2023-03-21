import { ClientError, RequestError } from '@/types/apiResult'
import { AxiosError, isAxiosError } from 'axios'

export const handleClientError = (err: AxiosError | any) => {
  const validateResult: any = {}
  if (isAxiosError(err)) {
    if (err.response?.status === 400) {
      const validateErrors: RequestError = err.response?.data
      if (
        Array.isArray(validateErrors.error) &&
        validateErrors.error.length > 0 &&
        'field' in validateErrors.error[0] &&
        'msg' in validateErrors.error[0]
      ) {
        validateErrors.error.forEach((validateError: ClientError) => {
          validateResult[validateError.field] = validateError.msg
        })
      }
    }
  }
  return validateResult
}
