import Admin from "./admin"

interface IAdminRepository {
  find(adminId: string): Promise<Admin | null>
  selectIdsByRoomId(roomId: string): Promise<string[]>
}

export default IAdminRepository
