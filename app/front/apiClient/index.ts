import { NuxtAxiosInstance } from "@nuxtjs/axios"
import { RestApi, PathsWithMethod } from "sushi-chat-shared"

type PathObject<
  Method extends "get" | "post" | "put",
  Path extends PathsWithMethod<Method>,
> = {
  pathname: Path
  params: RestApi<Method, Path>["params"]
}

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
 *  NOTE: サンプル実装のためコメントアウト
 *  async asyncData({ app }) {
 *    const sampleResponse = await app.$apiClient.get(
 *      { pathname: "/room/:id/history", params: { id: "roomId" } },
 *      {},
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
  public setToken(idToken: string | null) {
    if (idToken != null) {
      this.nuxtAxios.setToken(`Bearer ${idToken}`)
    } else {
      this.nuxtAxios.setToken(false)
    }
  }

  /**
   * getリクエストを行う
   * @param path エンドポイントを表すPathObjectまたはパス文字列（パスパラメータ（`:xyz`）を含まない場合は直接文字列を指定可能）
   * @param data 送信するデータ
   * @returns レスポンス
   */
  public async get<Path extends PathsWithMethod<"get">>(
    path: Path extends `${string}:${string}`
      ? PathObject<"get", Path>
      : Path | PathObject<"get", Path>,
    data: RestApi<"get", Path>["request"],
  ) {
    return await this.nuxtAxios.$get<RestApi<"get", Path>["response"]>(
      typeof path === "string" ? path : pathBuilder(path),
      { data },
    )
  }

  /**
   * postリクエストを行う
   * @param path エンドポイントを表すPathObjectまたはパス文字列
   * @param data 送信するデータ
   * @returns レスポンス
   */
  public async post<Path extends PathsWithMethod<"post">>(
    path: Path extends `${string}:${string}`
      ? PathObject<"post", Path>
      : Path | PathObject<"post", Path>,
    data: RestApi<"post", Path>["request"],
  ) {
    return await this.nuxtAxios.$post<RestApi<"post", Path>["response"]>(
      typeof path === "string" ? path : pathBuilder(path),
      data,
    )
  }

  /**
   * putリクエストを行う
   * @param path エンドポイントを表すPathObjectまたはパス文字列
   * @param data 送信するデータ
   * @returns レスポンス
   */
  public async put<Path extends PathsWithMethod<"put">>(
    path: Path extends `${string}:${string}`
      ? PathObject<"put", Path>
      : Path | PathObject<"put", Path>,
    data: RestApi<"put", Path>["request"],
  ) {
    return await this.nuxtAxios.$post<RestApi<"put", Path>["response"]>(
      typeof path === "string" ? path : pathBuilder(path),
      data,
    )
  }
}
