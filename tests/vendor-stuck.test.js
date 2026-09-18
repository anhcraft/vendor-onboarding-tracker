import { describe, expect, it } from 'vitest'
import { toVendorView } from '../server/utils/vendors.js'

const DAY_MS = 24 * 60 * 60 * 1000

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000)
}

function daysAgo(days) {
  return new Date(Date.now() - days * DAY_MS)
}

function vendorRow(overrides = {}) {
  return {
    id: 'vendor-1',
    name: 'Dabaco Group',
    region: 'Bac Ninh',
    notes: null,
    updatedAt: null,
    stage: 'CONTRACT_SENT',
    processCreatedAt: daysAgo(1),
    coordinatorName: null,
    coordinatorRole: null,
    ...overrides,
  }
}

describe('vendor stuck identification', () => {
  it('is not stuck when the latest VendorProcess is newer than 7 days', () => {
    const vendor = toVendorView(vendorRow({
      processCreatedAt: daysAgo(6),
    }))

    expect(vendor.isStuck).toBe(false)
  })

  it('is stuck when the latest VendorProcess is exactly 7 days old', () => {
    const vendor = toVendorView(vendorRow({
      processCreatedAt: daysAgo(7),
    }))

    expect(vendor.isStuck).toBe(true)
  })

  it('is stuck when the latest VendorProcess is older than 7 days', () => {
    const vendor = toVendorView(vendorRow({
      processCreatedAt: daysAgo(8),
    }))

    expect(vendor.isStuck).toBe(true)
  })

  it('identifies stuck vendors from VendorProcess.createdAt, not Vendors.updatedAt', () => {
    const recentlyUpdated = toVendorView(vendorRow({
      updatedAt: hoursAgo(1),
      processCreatedAt: daysAgo(10),
    }))
    const recentlyAdvanced = toVendorView(vendorRow({
      updatedAt: daysAgo(10),
      processCreatedAt: hoursAgo(1),
    }))

    expect(recentlyUpdated.isStuck).toBe(true)
    expect(recentlyAdvanced.isStuck).toBe(false)
  })

  it('is not stuck when the vendor has no process timestamp', () => {
    const vendor = toVendorView(vendorRow({
      processCreatedAt: null,
      updatedAt: daysAgo(30),
    }))

    expect(vendor.isStuck).toBe(false)
  })
})
