import express from "express"
import admin from "./initFirebase"

export const verifyIdToken = async (idToken: string) => {
  const decodedToken = await admin.auth().verifyIdToken(idToken)
  const uid = decodedToken.uid
  return uid
}

const checkAndGetUserId = async (
  req: express.Request,
  res: express.Response,
) => {
  const idToken = req.headers.authorization
  if (idToken == null) {
    // NOTE: ここでレスポンスを返しているけど、他のところでやった方が良いかも（yuta-ike）
    res.status(403).json({ error: "No credentials sent!" })
    return
  }
  try {
    const userId = await verifyIdToken(idToken)
    return userId
  } catch (e) {
    console.error(e)
    // NOTE: ここでレスポンスを返しているけど、他のところでやった方が良いかも（yuta-ike）
    res.status(403).json({ error: "Auth failed!" })
    return
  }
}

export default checkAndGetUserId
