import Admin from "./admin"

interface IAdminRepository {
  find(adminId: string): Promise<Admin | null>
  selectByRoomId(roomId: string): Promise<Admin[]>
}

export default IAdminRepository
