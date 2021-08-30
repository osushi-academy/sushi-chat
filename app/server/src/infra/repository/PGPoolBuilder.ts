import { Pool } from "pg"

class PGPoolBuilder {
  constructor(
    private readonly connectionString: string,
    private readonly ssl: boolean,
  ) {}

  public build(): Pool {
    const option: Record<string, unknown> = {
      connectionString: this.connectionString,
    }
    if (this.ssl) {
      option["ssl"] = {
        rejectUnauthorized: false,
      }
    }

    return new Pool(option)
  }
}

export default PGPoolBuilder
