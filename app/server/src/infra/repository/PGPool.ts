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
    await this.pgPool.end()
  }
}

export default PGPool
