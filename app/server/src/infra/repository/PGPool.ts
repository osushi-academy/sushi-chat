import { Pool, PoolClient } from "pg"

class PGPool {
  private readonly pgPool: Pool

  constructor(connectionString: string, ssl: boolean) {
    const option: Record<string, unknown> = {
      connectionString,
    }
    if (ssl) {
      option["ssl"] = {
        rejectUnauthorized: false,
      }
    }

    this.pgPool = new Pool(option)
  }

  public async client(): Promise<PoolClient> {
    return await this.pgPool.connect()
  }

  public async end() {
    this.pgPool
      .end()
      .catch((e) =>
        console.error(`Failed to end postgres pool connection: ${e}`),
      )
  }
}

export default PGPool
