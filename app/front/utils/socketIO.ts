import { io } from "socket.io-client"
const buildSocket = (idToken?: string | null) =>
  io(process.env.apiBaseUrl as string, {
    auth: {
      token: idToken || null,
    },
    withCredentials: true,
  })
export default buildSocket
