import type { Chore, ChoreCompletion, ChoreList, Repeat, UserId } from '../data/types'
import { addDays, addMonths, dateOf, daysBetween, daysUntil } from './format'

export const repeatLabels: Record<Repeat, string> = {
  none: 'Does not repeat',
  daily: 'Every day',
  weekly: 'Every week',
  biweekly: 'Every 2 weeks',
  monthly: 'Every month',
}

export function nextDueDate(isoDate: string, repeat: Repeat): string {
  switch (repeat) {
    case 'daily':
      return addDays(isoDate, 1)
    case 'weekly':
      return addDays(isoDate, 7)
    case 'biweekly':
      return addDays(isoDate, 14)
    case 'monthly':
      return addMonths(isoDate, 1)
    case 'none':
      return isoDate
  }
}

/** Whoever comes after `current` in the rotation, wrapping around. */
export function nextInRotation(rotation: UserId[], current: UserId | null): UserId | null {
  if (rotation.length === 0) return current
  const i = current ? rotation.indexOf(current) : -1
  return rotation[(i + 1) % rotation.length]
}

/** The next few turns for a repeating chore, starting with the current one. */
export function upcomingTurns(chore: Chore, count: number): { who: UserId; due: string }[] {
  if (!chore.assignedTo) return []
  const turns = [{ who: chore.assignedTo, due: chore.dueDate }]
  if (chore.repeat === 'none') return turns
  while (turns.length < count) {
    const prev = turns[turns.length - 1]
    turns.push({ who: nextInRotation(chore.rotation, prev.who) ?? prev.who, due: nextDueDate(prev.due, chore.repeat) })
  }
  return turns
}

/** Roommates who share an area, in room order. An area with no members listed is shared by everyone. */
export function areaMembers<T extends { id: UserId }>(list: ChoreList, roommates: T[]): T[] {
  if (list.memberIds.length === 0) return roommates
  return roommates.filter((r) => list.memberIds.includes(r.id))
}

/** Days late a completion was (0 if on time or early). */
export function daysLate(completion: ChoreCompletion): number {
  return Math.max(0, daysBetween(completion.dueDate, dateOf(completion.at)))
}

/**
 * Days after a due date that a missed chore stays private. During the grace period only the
 * person it's assigned to sees it as late; everyone else sees it as simply "due".
 */
export const LATE_GRACE_DAYS = 2

type DueState = Pick<Chore, 'dueDate' | 'done' | 'assignedTo'>

/** Past its due date and still someone's turn. */
export function isOverdue(chore: DueState): boolean {
  return !chore.done && chore.assignedTo !== null && daysUntil(chore.dueDate) < 0
}

/** Overdue and past the grace period, so the whole room can see it's late. */
export function isLateForRoom(chore: DueState): boolean {
  return isOverdue(chore) && daysUntil(chore.dueDate) < -LATE_GRACE_DAYS
}

/** Whether `viewerId` should see this chore as late: right away for your own, after the grace period for anyone else's. */
export function isLateFor(chore: DueState, viewerId: UserId): boolean {
  return chore.assignedTo === viewerId ? isOverdue(chore) : isLateForRoom(chore)
}

/** For an overdue chore, how many more days it stays private to its assignee (0 once the room can see it). */
export function privateDaysLeft(chore: DueState): number {
  return isOverdue(chore) ? Math.max(0, LATE_GRACE_DAYS + 1 + daysUntil(chore.dueDate)) : 0
}

/**
 * Days late a completion was, as `viewerId` should see it. Whoever did it (or whose turn it was)
 * sees the real number; for everyone else, finishing within the grace period counts as on time.
 */
export function daysLateFor(completion: ChoreCompletion, viewerId: UserId): number {
  const late = daysLate(completion)
  if (viewerId === completion.doneBy || viewerId === completion.turnOf) return late
  return late > LATE_GRACE_DAYS ? late : 0
}
