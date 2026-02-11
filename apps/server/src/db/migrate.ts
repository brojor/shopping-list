import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required')
}

const pool = new Pool({ connectionString: databaseUrl })
const db = drizzle(pool)
const migrationsFolder = fileURLToPath(new URL('../../../drizzle', import.meta.url))

try {
  await migrate(db, { migrationsFolder })
  console.log('Database migrations applied successfully')
}
finally {
  await pool.end()
}
