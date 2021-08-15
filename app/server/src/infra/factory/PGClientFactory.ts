import { Client } from "pg"

class PGClientFactory {
  public static create(): Client {
    const option: Record<string, unknown> = {
      connectionString: process.env.DATABASE_URL,
    }
    if (process.env.DB_SSL !== "OFF") {
      option["ssl"] = {
        rejectUnauthorized: false,
      }
    }
    const client = new Client(option)
    client.connect().catch(console.error)

    return client
  }
}

export default PGClientFactory
