import Admin from "./admin"

interface IAdminRepository {
  find(id: string): Promise<Admin | null>
  update(admin: Admin): void
}

export default IAdminRepository
