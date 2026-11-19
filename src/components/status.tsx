import { useApp } from '../data/store'
import type { Iou, UserId } from '../data/types'
import { isLateFor } from '../lib/chores'
import { daysUntil, formatDate } from '../lib/format'
import { Tag } from './Tag'

/**
 * When a chore is due. A missed chore only looks late to its assignee at first; roommates
 * see a neutral "Due" tag until the grace period is over (see `LATE_GRACE_DAYS`).
 */
export function DueTag({ dueDate, done, assignedTo = null }: { dueDate: string; done: boolean; assignedTo?: UserId | null }) {
  const { me } = useApp()
  if (done) return <Tag tone="success">Done</Tag>
  const days = daysUntil(dueDate)
  if (days < 0) {
    return isLateFor({ dueDate, done, assignedTo }, me!.id)
      ? <Tag tone="danger">Was due {formatDate(dueDate)}</Tag>
      : <Tag>Due {formatDate(dueDate)}</Tag>
  }
  if (days === 0) return <Tag>Due today</Tag>
  if (days === 1) return <Tag>Due tomorrow</Tag>
  return <Tag>Due {formatDate(dueDate)}</Tag>
}

export function IouStatusTag({ iou }: { iou: Iou }) {
  switch (iou.status) {
    case 'pending':
      return <Tag tone="brand">Waiting to confirm</Tag>
    case 'declined':
      return <Tag>Declined</Tag>
    case 'settled':
      return <Tag tone="success">Settled</Tag>
    case 'open':
      return iou.paidMarks.length > 0 ? <Tag tone="brand">Marked paid by one</Tag> : <Tag>Open</Tag>
  }
}
