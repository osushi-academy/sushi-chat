interface IAdminAuth {
  verifyIdToken(token: string): Promise<VerifyResult>
}

/**
 * @field adminId idTokenの検証の結果得られたuserのid
 * @field name user名 取得できないこともあるみたい(firebase SDKで取得できるUserRecordの型がnullableになっている)
 */
export type VerifyResult = { adminId: string; name: string }

export default IAdminAuth
