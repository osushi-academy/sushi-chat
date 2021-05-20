import { io } from 'socket.io-client'
const socket = io(process.env.apiBaseUrl as string)
export default socket
