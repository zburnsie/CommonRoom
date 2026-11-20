import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../data/store'
import { activityLink, describeActivity } from '../lib/activity'
import { formatDate, formatTimestamp } from '../lib/format'
import { useUnreadUpdates } from '../lib/updates'
import { ActivityMark } from './ActivityList'
import { Button } from './Button'

const SHOWN = 3

/**
 * The top of the room home: chores roommates have asked you to take (accept or decline),
 * then unread notifications — reminders, chores done, and (with money on) IOUs. Opening one
 * marks it read; the section goes away when there's nothing to answer and nothing unread.
 */
export function Updates() {
  const { state, me, room, nameOf, markInboxRead, markActivityRead, respondToRequest } = useApp()
  const unread = useUnreadUpdates()
  const [showAll, setShowAll] = useState(false)
  const [answered, setAnswered] = useState<string | null>(null)
  const roomListIds = new Set(state.choreLists.filter((l) => l.roomId === room!.id).map((l) => l.id))
  const requests = state.chores.filter((c) => roomListIds.has(c.listId) && !c.done && !c.assignedTo && c.pendingAssignee === me!.id)
  const requestIds = new Set(requests.map((c) => c.id))
  // An open request shows as its own card with Accept / Decline, not as a line here too.
  const items = unread.filter((a) => !(a.kind === 'chore-requested' && a.choreId && requestIds.has(a.choreId)))
  if (requests.length === 0 && items.length === 0 && !answered) return null
  const shown = showAll ? items : items.slice(0, SHOWN)
  const more = items.length - shown.length
  const count = requests.length + items.length

  return (
    <section aria-labelledby="updates-heading" className="flex flex-col gap-2 rounded-md border border-accent-edge bg-surface p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="updates-heading" className="text-heading">
          Updates {count > 0 && <span className="text-amount text-ink-muted">{count}</span>}
        </h2>
        {items.length > 0 && <Button variant="secondary" onClick={markInboxRead}>Mark all as read</Button>}
      </div>
      {answered && (
        <p role="status" className="text-body text-ink-muted">
          {answered}{' '}
          <button type="button" className="text-label underline" onClick={() => setAnswered(null)}>OK</button>
        </p>
      )}
      {requests.length > 0 && (
        <ul className="flex flex-col gap-2">
          {requests.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-4 rounded-md border border-sky bg-paper p-4">
              <span className="flex min-w-0 flex-1 flex-col">
                <Link to={`/chores/${c.id}`} className="text-body hover:underline">
                  {nameOf(c.requestedBy)} asked you to take “{c.title}”
                </Link>
                <span className="text-caption text-ink-muted">
                  Due {formatDate(c.dueDate)}{c.rotation.length > 1 && ' · rotates after you'}
                </span>
              </span>
              <span className="flex gap-2">
                <Button variant="confirm" onClick={() => {
                  respondToRequest(c.id, true)
                  setAnswered(`“${c.title}” is on your list.`)
                }}>Accept</Button>
                <Button variant="secondary" onClick={() => {
                  respondToRequest(c.id, false)
                  setAnswered(`Declined “${c.title}”. We let ${nameOf(c.requestedBy)} know.`)
                }}>Decline</Button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {shown.length > 0 && <ul className="flex flex-col divide-y divide-rule">
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
      </ul>}
      {more > 0 && (
        <button type="button" className="text-label self-start text-ink-muted underline hover:text-ink" onClick={() => setShowAll(true)}>
          Show {more} more
        </button>
      )}
    </section>
  )
}
