import * as admin from "firebase-admin"
import IAdminAuth, { VerifyResult } from "../../domain/admin/IAdminAuth"
import Admin from "../../domain/admin/admin"

class AdminAuth implements IAdminAuth {
  private static cert = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? "",
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "",
    // NOTE: 改行コードを変換する（参考 https://stackoverflow.com/questions/50299329/node-js-firebase-service-account-private-key-wont-parse）
    privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(
      /\\n/g,
      "\n",
    ),
  }

  constructor() {
    if (admin.apps.length === 0) {
      admin.initializeApp({ credential: admin.credential.cert(AdminAuth.cert) })
    }
  }

  public async verifyIdToken(token: string): Promise<VerifyResult> {
    const decodedToken = await admin
      .auth()
      .verifyIdToken(token)
      .catch((e) => {
        const date = new Date().toISOString()
        console.error(`[${date}] AdminAuth.verifyIdToken()`)
        throw e
      })

    const uid = decodedToken.uid

    const userRecord = await admin.auth().getUser(uid)
    const name = userRecord.displayName ?? Admin.NO_NAME_USER

    return { adminId: uid, name }
  }
}

export default AdminAuth
