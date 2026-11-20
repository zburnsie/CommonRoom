import { Link } from 'react-router-dom'
import { useApp } from '../data/store'
import type { Activity } from '../data/types'
import { activityLink, describeActivity } from '../lib/activity'
import { formatTimestamp } from '../lib/format'
import { Avatar } from './Avatar'

/** Bell icon (16×16) for reminders, which never show who sent them. */
function BellIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

/**
 * Who an entry is from: the roommate's avatar, or a bell for reminders. Reminders from
 * Common Room and anonymous ones from roommates look the same, so the sender stays hidden.
 */
export function ActivityMark({ activity }: { activity: Activity }) {
  const { userOf } = useApp()
  if (activity.kind === 'chore-reminder' || activity.kind === 'chore-nudged') {
    return (
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-pill border border-rule bg-sky text-ink">
        <BellIcon />
      </span>
    )
  }
  const actor = userOf(activity.actor)
  return actor ? <Avatar user={actor} size="sm" /> : null
}

export function ActivityList({ items, showUnread = false }: { items: Activity[]; showUnread?: boolean }) {
  const { me, nameOf } = useApp()
  return (
    <ul className="flex flex-col divide-y divide-rule rounded-md border border-rule bg-surface">
      {items.map((a) => {
        const link = activityLink(a)
        const body = (
          <div className="flex items-start gap-4 p-4">
            <ActivityMark activity={a} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-body">{describeActivity(a, nameOf, me!.id)}</span>
              <span className="text-caption text-ink-muted">{formatTimestamp(a.at)}</span>
            </div>
            {showUnread && !a.readBy.includes(me!.id) && (
              <span className="inline-flex size-2 shrink-0 items-center justify-center">
                <span className="size-2 rounded-pill bg-sky" aria-hidden="true" />
                <span className="sr-only">Unread</span>
              </span>
            )}
          </div>
        )
        return <li key={a.id}>{link ? <Link to={link} className="block hover:bg-paper">{body}</Link> : body}</li>
      })}
    </ul>
  )
}
