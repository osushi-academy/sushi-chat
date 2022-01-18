import { ChatItemModel, RoomModel, StampModel } from "./models"
import { ErrorResponse, SuccessResponse } from "./responseBuilder"
import { EmptyRecord as Empty } from "./utils"

export type RestApiDefinition = {
  "/": {
    params: Empty
    methods: {
      get: {
        query: Empty
        response: "ok"
      }
    }
  }
  "/room": {
    params: Empty
    methods: {
      get: {
        query: Empty
        response: SuccessResponse<RoomModel[]> | ErrorResponse
      }
      post: {
        query: Empty
        request: {
          title: string
          topics: {
            title: string
          }[]
          description?: string
        }
        response: SuccessResponse<RoomModel> | ErrorResponse
      }
    }
  }
  "/room/:id": {
    params: {
      id: string
    }
    methods: {
      get: {
        query: Empty
        response: SuccessResponse<RoomModel> | ErrorResponse
      }
    }
  }
  "/room/:id/start": {
    params: {
      id: string
    }
    methods: {
      put: {
        query: Empty
        request: Empty
        response: SuccessResponse | ErrorResponse
      }
    }
  }
  "/room/:id/history": {
    params: {
      id: string
    }
    methods: {
      get: {
        query: Empty
        response:
          | SuccessResponse<{
              chatItems: ChatItemModel[]
              stamps: StampModel[]
              pinnedChatItemIds: string[]
            }>
          | ErrorResponse
      }
    }
  }
  "/room/:id/archive": {
    params: {
      id: string
    }
    methods: {
      put: {
        query: Empty
        request: Empty
        response: SuccessResponse | ErrorResponse
      }
    }
  }
  "/room/:id/invited": {
    params: {
      id: string
    }
    methods: {
      post: {
        query: {
          admin_invite_key: string
        }
        request: Empty
        response: SuccessResponse | ErrorResponse
      }
    }
  }
}

// ここはからはexpressやaxiosのAPI定義を作るための型パズル
export type GeneralRestApiTypes = {
  [path: string]: {
    params: Record<string, unknown>
    methods: {
      [K in "post" | "put"]?: {
        query: Record<string, unknown>
        request: unknown
        response: unknown
      }
    }
    get?: {
      query: Record<string, unknown>
      response: unknown
    }
  }
}

// NOTE: RestApiTypesがGeneralRestApiTypesを実装しているかのチェック
// ここでtypecheckエラーが出ている場合、RestApiTypesの形式が間違えている
// eslint-disable-next-line no-constant-condition
if (false) {
  null as unknown as RestApiDefinition as GeneralRestApiTypes
}

export type PathsWithMethod<Method extends "get" | "post" | "put"> =
  NonNullable<
    {
      [Path in keyof RestApiDefinition]: Method extends keyof RestApiDefinition[Path]["methods"]
        ? Path
        : undefined
    }[keyof RestApiDefinition]
  >

export type GetMethodPath = PathsWithMethod<"get">
export type PostMethodPath = PathsWithMethod<"post">
export type PutMethodPath = PathsWithMethod<"put">

export type RestApi<
  Method extends "get" | "post" | "put",
  Path extends keyof RestApiDefinition,
> = Method extends "get"
  ? Path extends GetMethodPath
    ? {
        response: RestApiDefinition[Path]["methods"]["get"]["response"]
        params: RestApiDefinition[Path]["params"]
        query: RestApiDefinition[Path]["methods"]["get"]["query"]
      }
    : never
  : Method extends "post"
  ? Path extends PostMethodPath
    ? {
        request: RestApiDefinition[Path]["methods"]["post"]["request"]
        response: RestApiDefinition[Path]["methods"]["post"]["response"]
        params: RestApiDefinition[Path]["params"]
        query: RestApiDefinition[Path]["methods"]["post"]["query"]
      }
    : never
  : Method extends "put"
  ? Path extends PutMethodPath
    ? {
        request: RestApiDefinition[Path]["methods"]["put"]["request"]
        response: RestApiDefinition[Path]["methods"]["put"]["response"]
        params: RestApiDefinition[Path]["params"]
        query: RestApiDefinition[Path]["methods"]["put"]["query"]
      }
    : never
  : never
