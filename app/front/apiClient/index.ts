import { NuxtAxiosInstance } from "@nuxtjs/axios"
import { RestApi, PathsWithMethod, EmptyRecord } from "sushi-chat-shared"
import getIdToken from "~/utils/getIdToken"

type PathObject<
  Method extends "get" | "post" | "put",
  Path extends PathsWithMethod<Method>,
> = {
  pathname: Path
  params: RestApi<Method, Path>["params"]
}

type PathOrPathObj<
  Method extends "get" | "post" | "put",
  Path extends PathsWithMethod<Method>,
> = Path extends `${string}:${string}`
  ? PathObject<Method, Path>
  : Path | PathObject<Method, Path>

/**
 * PathObjectからパスを組み立てる関数
 * @param path PathObject
 * @returns
 */
const pathBuilder = (path: {
  pathname: string
  params: Record<string, string>
}) => {
  let p = path.pathname
  for (const [key, value] of Object.entries(path.params)) {
    p = p.replaceAll(new RegExp(`\\/:(${key})$`, "g"), `/${value}`)
    p = p.replaceAll(new RegExp(`\\/:(${key})(?=\\/)`, "g"), `/${value}`)
  }
  return p
}

/**
 * @sample
 * ```ts
 *  async asyncData({ app }) {
 *    const sampleResponse = await app.$apiClient.get(
 *      { pathname: "/room/:id/history", params: { id: "roomId" } },
 *    )
 *    if (sampleResponse.result === "success") {
 *      const rooms = sampleResponse.data
 *      console.log(rooms)
 *      return { rooms }
 *    } else {
 *      // NOTE: エラーハンドリングどうやるのがベストかわかってない....
 *      throw new Error("データの取得に失敗しました")
 *    }
 *  },
 * ```
 */
export default class Repository {
  constructor(public nuxtAxios: NuxtAxiosInstance) {
    this.nuxtAxios.setHeader("Content-Type", "application/json")
  }

  /**
   * idTokenを設定する
   * @param idToken idToken
   */
  public async setToken() {
    const idToken = await getIdToken()
    if (idToken != null) {
      this.nuxtAxios.setToken(`Bearer ${idToken}`)
    } else {
      this.nuxtAxios.setToken(false)
    }
  }

  /**
   * getリクエストを行う
   * @param path エンドポイントを表すPathObjectまたはパス文字列（パスパラメータ（`:xyz`）を含まない場合は直接文字列を指定可能）
   * @param query クエリパラメータ
   * @returns レスポンス
   */
  public async get<Path extends PathsWithMethod<"get">>(
    ...[path, query]: RestApi<"get", Path>["query"] extends EmptyRecord
      ? [path: PathOrPathObj<"get", Path>]
      : [path: PathOrPathObj<"get", Path>, query: RestApi<"get", Path>["query"]]
  ) {
    await this.setToken()
    return await this.nuxtAxios.$get<RestApi<"get", Path>["response"]>(
      typeof path === "string" ? path : pathBuilder(path),
      { params: query },
    )
  }

  /**
   * postリクエストを行う
   * @param path エンドポイントを表すPathObjectまたはパス文字列
   * @param data 送信するデータ
   * @returns レスポンス
   */
  public async post<Path extends PathsWithMethod<"post">>(
    ...[path, body, query]: RestApi<"post", Path>["request"] extends EmptyRecord
      ? RestApi<"post", Path>["query"] extends EmptyRecord
        ? [path: PathOrPathObj<"post", Path>]
        : [
            path: PathOrPathObj<"post", Path>,
            body: RestApi<"post", Path>["request"],
            query: RestApi<"post", Path>["query"],
          ]
      : RestApi<"post", Path>["query"] extends EmptyRecord
      ? [
          path: PathOrPathObj<"post", Path>,
          body: RestApi<"post", Path>["request"],
        ]
      : [
          path: PathOrPathObj<"post", Path>,
          body: RestApi<"post", Path>["request"],
          query: RestApi<"post", Path>["query"],
        ]
  ) {
    await this.setToken()
    return await this.nuxtAxios.$post<RestApi<"post", Path>["response"]>(
      typeof path === "string" ? path : pathBuilder(path),
      body,
      {
        params: query,
      },
    )
  }

  /**
   * putリクエストを行う
   * @param path エンドポイントを表すPathObjectまたはパス文字列
   * @param data 送信するデータ
   * @returns レスポンス
   */
  public async put<Path extends PathsWithMethod<"put">>(
    ...[path, data, query]: RestApi<"put", Path>["request"] extends EmptyRecord
      ? RestApi<"put", Path>["query"] extends EmptyRecord
        ? [path: PathOrPathObj<"put", Path>]
        : [
            path: PathOrPathObj<"put", Path>,
            body: RestApi<"put", Path>["request"],
            query: RestApi<"put", Path>["query"],
          ]
      : RestApi<"put", Path>["query"] extends EmptyRecord
      ? [
          path: PathOrPathObj<"put", Path>,
          body: RestApi<"put", Path>["request"],
        ]
      : [
          path: PathOrPathObj<"put", Path>,
          body: RestApi<"put", Path>["request"],
          query: RestApi<"put", Path>["query"],
        ]
  ) {
    await this.setToken()
    return await this.nuxtAxios.$put<RestApi<"put", Path>["response"]>(
      typeof path === "string" ? path : pathBuilder(path),
      data,
      {
        params: query,
      },
    )
  }
}
