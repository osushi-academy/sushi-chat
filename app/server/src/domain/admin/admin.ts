class Admin {
  constructor(
    public readonly id: string,
    public readonly name: string,
    // FIXME: repositoryの実装の都合状、adminの一覧取得の際にはundefinedになるようになっている
    public readonly managedRoomsIds?: string[],
  ) {}
}

export default Admin
