import IAdminRepository from "../../../domain/admin/IAdminRepository"
import Admin from "../../../domain/admin/admin"

class EphemeralAdminRepository implements IAdminRepository {
  public admins: Admin[] = []

  private get adminIds() {
    return this.admins.map((a) => a.id)
  }

  public createIfNotExist(admin: Admin) {
    if (this.adminIds.includes(admin.id)) return

    this.admins.push(admin)
  }

  public find(adminId: string): Promise<Admin | null> {
    return Promise.resolve(this.admins.find((a) => a.id === adminId) ?? null)
  }

  public selectIdsByRoomId(roomId: string): Promise<string[]> {
    return Promise.resolve(
      this.admins.filter((a) => roomId in a.managedRoomsIds).map((a) => a.id),
    )
  }
}

export default EphemeralAdminRepository
