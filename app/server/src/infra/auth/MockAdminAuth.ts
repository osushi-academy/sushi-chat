import IAdminAuth, { VerifyResult } from "../../domain/admin/IAdminAuth"

class MockAdminAuth implements IAdminAuth {
  constructor(private readonly dummyAdmin: { id: string; name: string }) {}

  public verifyIdToken(token: string): Promise<VerifyResult> {
    return Promise.resolve({
      adminId: this.dummyAdmin.id,
      name: this.dummyAdmin.name,
    })
  }
}

export default MockAdminAuth
