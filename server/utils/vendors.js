import { desc, eq } from 'drizzle-orm'
import { USER_ROLES } from '#lib/constants.js'
import { isProcessStuck } from '#lib/process-stage.js'
import { users, vendorProcess, vendors } from '../database/schema.js'

function toIsoString(value) {
  if (!value) {
    return ''
  }

  if (typeof value === 'string') {
    return value
  }

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}

function formatCoordinator(name, role) {
  return role === USER_ROLES.OPS_COORDINATOR && name ? name : 'N/A'
}

export function toVendorView(row) {
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    notes: row.notes ?? '',
    lastUpdate: toIsoString(row.updatedAt),
    stage: row.stage,
    coordinator: formatCoordinator(row.coordinatorName, row.coordinatorRole),
    isStuck: isProcessStuck(row.processCreatedAt),
  }
}

export function toProcessHistoryView(row) {
  return {
    id: row.id,
    prevStage: row.prevStage,
    newStage: row.newStage,
    createdAt: toIsoString(row.createdAt),
    coordinator: formatCoordinator(row.coordinatorName, row.coordinatorRole),
  }
}

export async function findLatestVendorProcess(db, vendorId) {
  const [latest] = await db
    .select()
    .from(vendorProcess)
    .where(eq(vendorProcess.vendorId, vendorId))
    .orderBy(desc(vendorProcess.createdAt))
    .limit(1)

  return latest ?? null
}

export async function listVendorsWithLatestProcess(db) {
  const latestProcess = db
    .selectDistinctOn([vendorProcess.vendorId], {
      vendorId: vendorProcess.vendorId,
      userId: vendorProcess.userId,
      newStage: vendorProcess.newStage,
      createdAt: vendorProcess.createdAt,
    })
    .from(vendorProcess)
    .orderBy(vendorProcess.vendorId, desc(vendorProcess.createdAt))
    .as('latest_process')

  return db
    .select({
      id: vendors.id,
      name: vendors.name,
      region: vendors.region,
      notes: vendors.notes,
      updatedAt: vendors.updatedAt,
      stage: latestProcess.newStage,
      processCreatedAt: latestProcess.createdAt,
      coordinatorName: users.name,
      coordinatorRole: users.role,
    })
    .from(vendors)
    .leftJoin(latestProcess, eq(vendors.id, latestProcess.vendorId))
    .leftJoin(users, eq(latestProcess.userId, users.id))
    .orderBy(vendors.name)
}

export async function listVendorProcessHistory(db, vendorId) {
  return db
    .select({
      id: vendorProcess.id,
      prevStage: vendorProcess.prevStage,
      newStage: vendorProcess.newStage,
      createdAt: vendorProcess.createdAt,
      coordinatorName: users.name,
      coordinatorRole: users.role,
    })
    .from(vendorProcess)
    .leftJoin(users, eq(vendorProcess.userId, users.id))
    .where(eq(vendorProcess.vendorId, vendorId))
    .orderBy(desc(vendorProcess.createdAt))
}
