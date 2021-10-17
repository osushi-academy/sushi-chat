import {
  ServerListenEventName,
  ServerListenEventResponse,
  ServerListenEventsMap,
} from "sushi-chat-shared"
import { SocketIOType } from "./socketIO"

// 型補完が効かないのでasがたくさん....
/**
 * socket.emitを、非同期処理と同様にasync-awaitで扱えるようにするヘルパー関数
 * @param socket Socketオブジェクト
 * @param eventName Emitするイベント名
 * @param payload リクエストデータ
 * @returns レスポンスデータ
 */
const emitAsync = <EventName extends ServerListenEventName>(
  socket: SocketIOType,
  eventName: EventName,
  payload: Parameters<ServerListenEventsMap[EventName]>[0],
): Promise<ServerListenEventResponse<EventName> & { result: "success" }> => {
  return new Promise((resolve, reject) => {
    const callback = (res: ServerListenEventResponse<EventName>) => {
      if (res.result === "error") {
        reject(new Error("api error"))
      } else {
        resolve(
          res as ServerListenEventResponse<EventName> & { result: "success" },
        )
      }
    }
    // @ts-ignore
    socket.emit<EventName>(eventName, payload, callback)
  })
}

export default emitAsync
