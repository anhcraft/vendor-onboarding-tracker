import { listVendorsWithLatestProcess, toVendorView } from '../utils/vendors.js'
import { requireDb } from '../utils/require-db.js'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const rows = await listVendorsWithLatestProcess(requireDb())
  return rows.map(toVendorView)
})
