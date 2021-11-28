import { ErrorResponse, ServerListenEventName } from "sushi-chat-shared"
import { Response } from "express"

export const handleSocketIOError = (
  callback: (response: ErrorResponse) => void,
  event: ServerListenEventName,
  error: RunTimeError,
) => {
  logError(event, error)

  callback({
    result: "error",
    error: {
      code: `${error.code}`,
      message: error.message ?? "Unknown error",
    },
  })
}

export const handleRestError = (
  error: RunTimeError,
  route: string,
  res: Response,
) => {
  logError(route, error)

  const code = error.code

  res.status(code).send({
    result: "error",
    error: {
      code: `${code}`,
      message: error.message ?? "Unknown error.",
    },
  })
}

export const logError = (context: string, error: RunTimeError) => {
  const date = new Date().toISOString()
  console.error(`[${date}]${context}:${error ?? "Unknown error."}`)
}

export class RunTimeError extends Error {
  readonly code: number

  constructor(message: string, code?: number) {
    super(message)
    this.name = "RunTimeError"
    this.code = code ?? 500
  }
}
