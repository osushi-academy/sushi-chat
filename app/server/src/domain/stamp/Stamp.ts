class Stamp {
  constructor(
    public readonly userId: string,
    public readonly roomId: string,
    public readonly topicId: string,
    public readonly timestamp: number,
  ) {}
}

export default Stamp
