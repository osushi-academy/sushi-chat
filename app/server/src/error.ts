import { ErrorResponse, ServerListenEventName } from "sushi-chat-shared"
import { Response } from "express"

export const handleSocketIOError = (
  callback: (response: ErrorResponse) => void,
  event: ServerListenEventName,
  error: ErrorWithCode,
) => {
  logError(event, error)

  callback({
    result: "error",
    error: {
      code: `${error.statusCode}`,
      message: error.message ?? "Unknown error",
    },
  })
}

export const handleRestError = (
  error: ErrorWithCode,
  route: string,
  res: Response,
) => {
  logError(route, error)

  const code = error.statusCode

  res.status(code).send({
    result: "error",
    error: {
      code: `${code}`,
      message: error.message ?? "Unknown error.",
    },
  })
}

export const logError = (context: string, error: ErrorWithCode) => {
  const date = new Date().toISOString()
  console.error(`[${date}]${context}:${error ?? "Unknown error."}`)
}

export class ErrorWithCode extends Error {
  readonly statusCode: number

  constructor(message: string, statusCode?: number) {
    super(message)
    this.name = "RunTimeError"
    this.statusCode = statusCode ?? 500
  }
}

export class ArgumentError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = "ArgumentError"
  }
}

export class NotFoundError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = "NotFoundError"
  }
}

export class StateError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = "StateError"
  }
}
