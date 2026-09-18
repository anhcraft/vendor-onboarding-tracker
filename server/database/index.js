import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'
import * as schema from './schema.js'

let db

export function getDb() {
  if (db) {
    return db
  }

  const databaseUrl = process.env.DATABASE_URL || process.env.NUXT_DATABASE_URL
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set')
  }

  db = drizzle({ client: new Pool({ connectionString: databaseUrl }), schema })
  return db
}
