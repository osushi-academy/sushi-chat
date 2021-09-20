class Admin {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly managedRoomsIds: string[],
  ) {}
}

export default Admin
