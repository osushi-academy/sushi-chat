class Admin {
  public static NO_NAME_USER = "No Name" // Firebase SDKでユーザーを取得したときにユーザー名が取得できない場合があるため

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly managedRoomsIds: string[],
  ) {}
}

export default Admin
