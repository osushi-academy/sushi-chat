import * as admin from "firebase-admin"

const cert = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? "",
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "",
  // NOTE: 改行コードを変換する（参考 https://stackoverflow.com/questions/50299329/node-js-firebase-service-account-private-key-wont-parse）
  privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(
    /\\n/g,
    "\n",
  ),
}

admin.initializeApp({
  credential: admin.credential.cert(cert),
})

export default admin
