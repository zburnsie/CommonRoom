import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../data/store'
import { activityLink, describeActivity } from '../lib/activity'
import { formatTimestamp } from '../lib/format'
import { useUnreadUpdates } from '../lib/updates'
import { ActivityMark } from './ActivityList'
import { Button } from './Button'

const SHOWN = 3

/**
 * Unread notifications at the top of the room home: chores assigned to you, reminders,
 * and (with money on) IOUs. Opening one marks it read; the section goes away when
 * there's nothing unread.
 */
export function Updates() {
  const { me, nameOf, markInboxRead, markActivityRead } = useApp()
  const items = useUnreadUpdates()
  const [showAll, setShowAll] = useState(false)
  if (items.length === 0) return null
  const shown = showAll ? items : items.slice(0, SHOWN)
  const more = items.length - shown.length

  return (
    <section aria-labelledby="updates-heading" className="flex flex-col gap-2 rounded-md border border-accent-edge bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="updates-heading" className="text-heading">
          Updates <span className="text-amount text-ink-muted">{items.length}</span>
        </h2>
        <Button variant="secondary" onClick={markInboxRead}>Mark all as read</Button>
      </div>
      <ul className="flex flex-col divide-y divide-rule">
        {shown.map((a) => {
          const link = activityLink(a)
          const body = (
            <>
              <ActivityMark activity={a} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-body">{describeActivity(a, nameOf, me!.id)}</span>
                <span className="text-caption text-ink-muted">{formatTimestamp(a.at)}</span>
              </span>
            </>
          )
          return (
            <li key={a.id}>
              {link ? (
                <Link to={link} onClick={() => markActivityRead(a.id)} className="flex items-center gap-4 py-2 hover:bg-paper">
                  {body}
                  <span className="text-ink-muted" aria-hidden="true">→</span>
                </Link>
              ) : (
                <div className="flex items-center gap-4 py-2">
                  {body}
                  <button type="button" className="text-label text-ink-muted underline hover:text-ink" onClick={() => markActivityRead(a.id)}>
                    Dismiss
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
      {more > 0 && (
        <button type="button" className="text-label self-start text-ink-muted underline hover:text-ink" onClick={() => setShowAll(true)}>
          Show {more} more
        </button>
      )}
    </section>
  )
}
