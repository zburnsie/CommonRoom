import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../data/store'
import type { Chore } from '../data/types'
import { repeatLabels } from '../lib/chores'
import { Avatar } from './Avatar'
import { DueTag, WaitingTag } from './status'
import { Tag } from './Tag'

/** A chore that links to its page. `action` (like a complete button) sits inside the box on the right, outside the link. */
export function ChoreRow({ chore, showList = false, action }: { chore: Chore; showList?: boolean; action?: ReactNode }) {
  const { state, userOf, nameOf } = useApp()
  // While a request is open, show who was asked, but it isn't theirs yet.
  const pending = !chore.assignedTo && chore.pendingAssignee ? userOf(chore.pendingAssignee) : undefined
  const assignee = chore.assignedTo ? userOf(chore.assignedTo) : undefined
  const list = state.choreLists.find((l) => l.id === chore.listId)
  const to = chore.assignedTo || pending ? `/chores/${chore.id}` : `/chores/${chore.id}/assign`
  const content = (
    <>
      {assignee ? <Avatar user={assignee} /> : pending ? <span className="opacity-50"><Avatar user={pending} /></span> : <span className="size-8 rounded-pill border border-dashed border-ink-muted" aria-hidden />}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={`text-body ${chore.done ? 'text-ink-muted line-through' : ''}`}>{chore.title}</span>
        <span className="text-caption text-ink-muted">
          {assignee ? nameOf(assignee.id) : pending ? `Waiting on ${nameOf(pending.id, true)}` : 'Unassigned'}
          {' · '}
          {repeatLabels[chore.repeat]}
          {showList && list && ` · ${list.name}`}
        </span>
      </div>
      {chore.assignedTo ? (
        <DueTag dueDate={chore.dueDate} done={chore.done} assignedTo={chore.assignedTo} />
      ) : pending ? (
        <WaitingTag chore={chore} />
      ) : (
        <Tag tone="brand">Needs someone</Tag>
      )}
    </>
  )
  if (!action) {
    return (
      <Link to={to} className="flex flex-wrap items-center gap-4 rounded-md border border-rule bg-surface p-4 hover:border-ink">
        {content}
      </Link>
    )
  }
  return (
    <div className="flex items-center rounded-md border border-rule bg-surface hover:border-ink">
      <Link to={to} className="flex min-w-0 flex-1 flex-wrap items-center gap-4 p-4">
        {content}
      </Link>
      <div className="shrink-0 pr-4">{action}</div>
    </div>
  )
}
