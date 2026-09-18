import { getDb } from '../database/index.js'

export function requireDb() {
  try {
    return getDb()
  }
  catch (error) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }
}
