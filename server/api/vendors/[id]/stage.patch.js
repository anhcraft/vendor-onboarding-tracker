import { eq } from 'drizzle-orm'
import { USER_ROLES } from '#lib/constants.js'
import { validateStageTransition } from '#lib/process-stage.js'
import { vendorProcess, vendors } from '../../../database/schema.js'
import { requireDb } from '../../../utils/require-db.js'
import { findLatestVendorProcess } from '../../../utils/vendors.js'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  if (user.role !== USER_ROLES.OPS_COORDINATOR) {
    throw createError({
      statusCode: 403,
      message: 'Only ops coordinators can update vendor stages',
    })
  }

  const vendorId = getRouterParam(event, 'id')
  const body = await readBody(event)
  const stage = typeof body?.stage === 'string' ? body.stage : ''

  if (!vendorId || !stage) {
    throw createError({
      statusCode: 400,
      message: 'Vendor id and stage are required',
    })
  }

  const db = requireDb()
  const [vendor] = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(eq(vendors.id, vendorId))
    .limit(1)

  if (!vendor) {
    throw createError({
      statusCode: 404,
      message: 'Vendor not found',
    })
  }

  const latest = await findLatestVendorProcess(db, vendorId)
  if (!latest) {
    throw createError({
      statusCode: 400,
      message: 'Vendor has no process history',
    })
  }

  try {
    validateStageTransition(latest.newStage, stage)
  }
  catch (error) {
    throw createError({
      statusCode: 400,
      message: error.message,
    })
  }

  await db.insert(vendorProcess).values({
    vendorId,
    userId: user.id,
    prevStage: latest.newStage,
    newStage: stage,
  })

  await db
    .update(vendors)
    .set({ updatedAt: new Date() })
    .where(eq(vendors.id, vendorId))

  return { ok: true }
})
