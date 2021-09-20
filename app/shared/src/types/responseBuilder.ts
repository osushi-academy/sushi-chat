// DEFAULT RESPONSE
export type SuccessResponse<Data = undefined> = {
  result: "success"
  data: Data
}
export type ErrorResponse = {
  result: "error"
  error: {
    code: string
    message: string
  }
}
