import { compare } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { users } from '../../database/schema.js'
import { requireDb } from '../../utils/require-db.js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const username = typeof body?.username === 'string' ? body.username.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: 'Username and password are required',
    })
  }

  const db = requireDb()
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1)

  if (!user || !(await compare(password, user.password))) {
    throw createError({
      statusCode: 401,
      message: 'Invalid username or password',
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
    },
  })

  return { ok: true }
})
