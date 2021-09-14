import * as admin from "firebase-admin"

const cert = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID ?? "",
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? "",
  privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? "").replace(
    /\\n/g,
    "\n",
  ),
}

admin.initializeApp({
  credential: admin.credential.cert(cert),
})

export default admin
