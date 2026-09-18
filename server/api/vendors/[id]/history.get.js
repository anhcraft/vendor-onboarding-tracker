import { eq } from 'drizzle-orm'
import { vendors } from '../../../database/schema.js'
import { requireDb } from '../../../utils/require-db.js'
import { listVendorProcessHistory, toProcessHistoryView } from '../../../utils/vendors.js'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const vendorId = getRouterParam(event, 'id')
  if (!vendorId) {
    throw createError({
      statusCode: 400,
      message: 'Vendor id is required',
    })
  }

  const db = requireDb()
  const [vendor] = await db
    .select({ id: vendors.id, name: vendors.name })
    .from(vendors)
    .where(eq(vendors.id, vendorId))
    .limit(1)

  if (!vendor) {
    throw createError({
      statusCode: 404,
      message: 'Vendor not found',
    })
  }

  const rows = await listVendorProcessHistory(db, vendorId)

  return {
    vendor,
    history: rows.map(toProcessHistoryView),
  }
})
