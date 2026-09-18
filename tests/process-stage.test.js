import { describe, expect, it } from 'vitest'
import { PROCESS_STAGES, STUCK_DAYS } from '#lib/constants.js'
import { canTransitionTo, getNextStage, isProcessStuck, isStageOptionEnabled, validateStageTransition } from '#lib/process-stage.js'

describe('process stage transitions', () => {
  it.each([
    ['CONTRACT_SENT', 'CONTRACT_SIGNED'],
    ['CONTRACT_SIGNED', 'KYC_DOCS_RECEIVED'],
    ['KYC_DOCS_RECEIVED', 'KYC_VERIFIED'],
    ['KYC_VERIFIED', 'ACTIVE'],
  ])('allows %s -> %s', (prevStage, newStage) => {
    expect(() => validateStageTransition(prevStage, newStage)).not.toThrow()
  })

  it('rejects a no-op after the seed row', () => {
    expect(() => validateStageTransition('CONTRACT_SENT', 'CONTRACT_SENT')).toThrow(
      'New stage must differ from previous stage',
    )
  })

  it('rejects skipped stages', () => {
    expect(() => validateStageTransition('CONTRACT_SENT', 'KYC_DOCS_RECEIVED')).toThrow(
      'Invalid stage transition from CONTRACT_SENT to KYC_DOCS_RECEIVED',
    )
  })

  it('rejects backwards transitions', () => {
    expect(() => validateStageTransition('CONTRACT_SIGNED', 'CONTRACT_SENT')).toThrow(
      'Invalid stage transition from CONTRACT_SIGNED to CONTRACT_SENT',
    )
  })

  it('rejects transitions from ACTIVE', () => {
    expect(() => validateStageTransition('ACTIVE', 'KYC_VERIFIED')).toThrow(
      'Invalid stage transition from ACTIVE to KYC_VERIFIED',
    )
    expect(getNextStage('ACTIVE')).toBeNull()
  })

  it('rejects unknown stages', () => {
    expect(() => validateStageTransition('NOT_A_STAGE', 'CONTRACT_SIGNED')).toThrow(
      'Unknown previous stage: NOT_A_STAGE',
    )
    expect(() => validateStageTransition('CONTRACT_SENT', 'DONE')).toThrow(
      'Unknown new stage: DONE',
    )
  })

  it('exposes the ordered stage list', () => {
    expect(PROCESS_STAGES).toEqual([
      'CONTRACT_SENT',
      'CONTRACT_SIGNED',
      'KYC_DOCS_RECEIVED',
      'KYC_VERIFIED',
      'ACTIVE',
    ])
  })

  it('enables only the current stage and the valid next hop', () => {
    expect(canTransitionTo('CONTRACT_SENT', 'CONTRACT_SIGNED')).toBe(true)
    expect(canTransitionTo('CONTRACT_SENT', 'KYC_VERIFIED')).toBe(false)

    expect(isStageOptionEnabled('CONTRACT_SENT', 'CONTRACT_SENT')).toBe(true)
    expect(isStageOptionEnabled('CONTRACT_SENT', 'CONTRACT_SIGNED')).toBe(true)
    expect(isStageOptionEnabled('CONTRACT_SENT', 'KYC_DOCS_RECEIVED')).toBe(false)
    expect(isStageOptionEnabled('ACTIVE', 'ACTIVE')).toBe(true)
    expect(isStageOptionEnabled('ACTIVE', 'KYC_VERIFIED')).toBe(false)
  })
})

describe('stuck process detection', () => {
  const now = new Date('2026-09-18T00:00:00.000Z')

  it('is not stuck when the latest process is within 7 days', () => {
    expect(isProcessStuck('2026-09-12T00:00:00.000Z', now)).toBe(false)
  })

  it('is not stuck one millisecond before the 7-day threshold', () => {
    expect(isProcessStuck('2026-09-11T00:00:00.001Z', now)).toBe(false)
  })

  it('is stuck when the latest process is exactly 7 days old', () => {
    expect(isProcessStuck('2026-09-11T00:00:00.000Z', now)).toBe(true)
  })

  it('is stuck when the latest process is older than 7 days', () => {
    expect(isProcessStuck('2026-09-01T00:00:00.000Z', now)).toBe(true)
  })

  it('accepts a Date instance', () => {
    expect(isProcessStuck(new Date('2026-09-11T00:00:00.000Z'), now)).toBe(true)
  })

  it('is not stuck when process createdAt is missing or invalid', () => {
    expect(isProcessStuck(null, now)).toBe(false)
    expect(isProcessStuck(undefined, now)).toBe(false)
    expect(isProcessStuck('', now)).toBe(false)
    expect(isProcessStuck('not-a-date', now)).toBe(false)
  })

  it('uses the hardcoded stuck-day threshold', () => {
    expect(STUCK_DAYS).toBe(7)
    expect(isProcessStuck('2026-09-11T00:00:00.000Z', now, STUCK_DAYS)).toBe(true)
    expect(isProcessStuck('2026-09-11T00:00:00.000Z', now, 8)).toBe(false)
  })
})
