import Admin from "./admin"

interface IAdminRepository {
  find(adminId: string): Promise<Admin | null>
}

export default IAdminRepository
