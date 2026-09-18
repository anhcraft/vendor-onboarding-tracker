import 'dotenv/config'
import { hash } from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { BCRYPT_ROUNDS, PROCESS_STAGES, USER_ROLES } from '#lib/constants.js'
import { getDb } from './index.js'
import { users, vendorProcess, vendors } from './schema.js'

const SEED_USERS = [
  { name: 'Vi', username: 'vi' },
  { name: 'Linh', username: 'linh' },
  { name: 'Huy', username: 'huy' },
  { name: 'Mai', username: 'mai' },
]

const SEED_VENDORS = [
  { name: 'Vinh Hoan Corporation', region: 'Dong Thap' },
  { name: 'Loc Troi Group', region: 'An Giang' },
  { name: 'Masan Consumer', region: 'HCMC' },
  { name: 'Gia Lai Coffee Company (GiCo)', region: 'Gia Lai' },
  { name: 'Intimex Group', region: 'HCMC' },
  { name: 'Thanh Thanh Cong - Bien Hoa (TTC AgriS)', region: 'Tay Ninh' },
  { name: 'Dabaco Group', region: 'Bac Ninh' },
  { name: 'Phuc Sinh Corporation', region: 'HCMC' },
  { name: 'Visimex Joint Stock Company', region: 'Hanoi' },
  { name: 'Minh Phu Seafood Corporation', region: 'Ca Mau' },
]

async function seedUsers(db, passwordHash) {
  for (const user of SEED_USERS) {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, user.username))
      .limit(1)

    if (existing) {
      continue
    }

    await db.insert(users).values({
      name: user.name,
      username: user.username,
      password: passwordHash,
      role: USER_ROLES.OPS_COORDINATOR,
    })
  }
}

async function seedVendors(db) {
  const seededVendors = []

  for (const vendor of SEED_VENDORS) {
    const [existing] = await db
      .select({ id: vendors.id })
      .from(vendors)
      .where(eq(vendors.name, vendor.name))
      .limit(1)

    if (existing) {
      seededVendors.push(existing)
      continue
    }

    const [created] = await db
      .insert(vendors)
      .values({
        name: vendor.name,
        region: vendor.region,
      })
      .returning({ id: vendors.id })

    seededVendors.push(created)
  }

  return seededVendors
}

async function seedVendorProcesses(db, seededVendors) {
  const initialStage = PROCESS_STAGES[0]

  for (const vendor of seededVendors) {
    const [existing] = await db
      .select({ id: vendorProcess.id })
      .from(vendorProcess)
      .where(eq(vendorProcess.vendorId, vendor.id))
      .limit(1)

    if (existing) {
      continue
    }

    await db.insert(vendorProcess).values({
      vendorId: vendor.id,
      userId: null,
      prevStage: initialStage,
      newStage: initialStage,
    })
  }
}

async function seed() {
  const db = getDb()
  const passwordHash = await hash('229000', BCRYPT_ROUNDS)

  await seedUsers(db, passwordHash)
  const seededVendors = await seedVendors(db)
  await seedVendorProcesses(db, seededVendors)

  console.log('Seed data applied')
}

await seed()
