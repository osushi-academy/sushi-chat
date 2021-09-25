class Stamp {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly roomId: string,
    public readonly topicId: number,
    public readonly createdAt: Date,
    public readonly timestamp: number,
  ) {}
}

export default Stamp
