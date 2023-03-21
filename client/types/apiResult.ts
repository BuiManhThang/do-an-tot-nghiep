export type RequestError = {
  msg: string
  error: ClientError[] | any
}

export type ClientError = {
  field: string
  value: any
  msg: string
}
