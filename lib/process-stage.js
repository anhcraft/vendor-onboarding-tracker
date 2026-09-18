import { PROCESS_STAGES, STUCK_DAYS } from './constants.js'

const DAY_MS = 24 * 60 * 60 * 1000

export function getNextStage(currentStage) {
  const index = PROCESS_STAGES.indexOf(currentStage)
  if (index === -1 || index === PROCESS_STAGES.length - 1) {
    return null
  }

  return PROCESS_STAGES[index + 1]
}

export function validateStageTransition(prevStage, newStage) {
  if (!PROCESS_STAGES.includes(prevStage)) {
    throw new Error(`Unknown previous stage: ${prevStage}`)
  }

  if (!PROCESS_STAGES.includes(newStage)) {
    throw new Error(`Unknown new stage: ${newStage}`)
  }

  if (prevStage === newStage) {
    throw new Error('New stage must differ from previous stage')
  }

  const expectedStage = getNextStage(prevStage)
  if (expectedStage !== newStage) {
    throw new Error(`Invalid stage transition from ${prevStage} to ${newStage}`)
  }
}

export function canTransitionTo(prevStage, newStage) {
  try {
    validateStageTransition(prevStage, newStage)
    return true
  }
  catch {
    return false
  }
}

export function isStageOptionEnabled(currentStage, optionStage) {
  return optionStage === currentStage || canTransitionTo(currentStage, optionStage)
}

export function isProcessStuck(createdAt, now = new Date(), stuckDays = STUCK_DAYS) {
  if (!createdAt) {
    return false
  }

  const created = createdAt instanceof Date ? createdAt : new Date(createdAt)
  if (Number.isNaN(created.getTime())) {
    return false
  }

  return now.getTime() - created.getTime() >= stuckDays * DAY_MS
}
