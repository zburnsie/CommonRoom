import type { Activity, UserId } from '../data/types'

type NameOf = (id: UserId | null | undefined, lower?: boolean) => string

/** The `actor` on reminders the app sends itself, rather than a roommate. */
export const SYSTEM_ACTOR = 'common-room'

/**
 * One plain sentence for a feed or inbox entry, from the viewer's point of view.
 * Reminders from roommates never say who sent them, except to the sender.
 */
export function describeActivity(a: Activity, nameOf: NameOf, viewerId?: UserId): string {
  const actor = nameOf(a.actor)
  const subject = nameOf(a.subject, true)
  switch (a.kind) {
    case 'room-created':
      return `${actor} created ${a.label}`
    case 'joined':
      return `${actor} joined ${a.label}`
    case 'list-created':
      return `${actor} started the ${a.label} chore list`
    case 'chore-assigned':
      return `${actor} assigned “${a.label}” to ${subject}`
    case 'chore-requested':
      return a.subject === viewerId ? `${actor} asked you to take “${a.label}”` : `${actor} asked ${subject} to take “${a.label}”`
    case 'chore-accepted':
      return `${actor} accepted “${a.label}”`
    case 'chore-declined':
      return `${actor} passed on “${a.label}”. It’s unassigned again`
    case 'chore-done':
      return a.subject
        ? `${actor} finished “${a.label}”. Next up: ${subject}`
        : `${actor} finished “${a.label}”`
    case 'chore-nudged':
      if (viewerId && viewerId === a.subject) return `Someone in your room sent a reminder about “${a.label}”`
      if (viewerId && viewerId === a.actor) return `You sent ${subject} an anonymous reminder about “${a.label}”`
      return `Someone in your room sent ${subject} a reminder about “${a.label}”`
    case 'chore-reminder':
      if (a.reminder === 'late') return `Reminder from Common Room: “${a.label}” is past due`
      return `Reminder from Common Room: “${a.label}” is due ${a.reminder === 'due-tomorrow' ? 'tomorrow' : 'today'}`
    case 'iou-logged':
      return `${actor} logged an IOU with ${subject}: ${a.label}`
    case 'iou-confirmed':
      return `${actor} confirmed the IOU: ${a.label}`
    case 'iou-countered':
      return `${actor} suggested ${a.label}`
    case 'iou-declined':
      return `${actor} declined the IOU: ${a.label}`
    case 'iou-marked-paid':
      return `${actor} marked the IOU with ${subject} as paid: ${a.label}`
    case 'iou-settled':
      return `${actor} and ${subject} settled up: ${a.label}`
  }
}

/** IOU activity, hidden everywhere while the `money` flag is off. */
export function isMoneyActivity(a: Activity): boolean {
  return a.kind.startsWith('iou-')
}

export function activityLink(a: Activity): string | null {
  if (a.choreId) return `/chores/${a.choreId}`
  if (a.iouId) return `/money/ious/${a.iouId}`
  if (a.listId) return `/chores/lists/${a.listId}`
  if (a.kind === 'iou-marked-paid' || a.kind === 'iou-settled') return `/money/settle/${a.actor}`
  return null
}
