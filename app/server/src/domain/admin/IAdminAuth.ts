interface IAdminAuth {
  verifyIdToken(token: string): Promise<VerifyResult>
}

export type VerifyResult = { adminId: string } // idTokenの検証の結果得られたuserのid

export default IAdminAuth
