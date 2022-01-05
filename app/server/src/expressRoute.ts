import express, { NextFunction } from "express"
import {
  GetMethodPath,
  PostMethodPath,
  PutMethodPath,
  RestApi,
} from "sushi-chat-shared"

type ExpressCore = ReturnType<typeof express>

// express用の型定義
export type Routes = Omit<ExpressCore, "get" | "post" | "put"> & {
  get<Path extends GetMethodPath>(
    path: Path,
    ...handlers: ((
      req: express.Request<
        RestApi<"get", Path>["params"],
        RestApi<"get", Path>["response"],
        unknown,
        RestApi<"get", Path>["query"]
      >,
      res: express.Response<RestApi<"get", Path>["response"]>,
      next: NextFunction,
    ) => void)[]
  ): void
  post<Path extends PostMethodPath>(
    path: Path,
    ...handlers: ((
      req: express.Request<
        RestApi<"post", Path>["params"],
        RestApi<"post", Path>["response"],
        RestApi<"post", Path>["request"],
        RestApi<"post", Path>["query"]
      >,
      res: express.Response<RestApi<"post", Path>["response"]>,
      next: NextFunction,
    ) => void)[]
  ): void
  put<Path extends PutMethodPath>(
    path: Path,
    ...handlers: ((
      req: express.Request<
        RestApi<"put", Path>["params"],
        RestApi<"put", Path>["response"],
        RestApi<"put", Path>["request"],
        RestApi<"put", Path>["query"]
      >,
      res: express.Response<RestApi<"put", Path>["response"]>,
      next: NextFunction,
    ) => void)[]
  ): void
}
