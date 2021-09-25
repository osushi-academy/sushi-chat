import Admin from "./admin"

interface IAdminRepository {
  createIfNotExist(admin: Admin): void
  find(adminId: string): Promise<Admin | null>
  selectIdsByRoomId(roomId: string): Promise<string[]>
}

export default IAdminRepository
