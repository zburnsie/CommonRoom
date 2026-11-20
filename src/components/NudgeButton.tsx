import { useEffect, useRef, useState } from 'react'
import { useApp } from '../data/store'
import type { Chore } from '../data/types'
import { formatTime } from '../lib/format'
import { Button } from './Button'

/** Only someone else's open turn can get a reminder. */
export function canNudge(chore: Chore, meId: string): boolean {
  return !!chore.assignedTo && chore.assignedTo !== meId && !chore.done
}

/**
 * Sends whoever's turn it is an anonymous reminder, once a day per chore. Says what will happen
 * before it's sent, and when it was sent afterwards. Shows nothing on your own chores, done
 * chores or unassigned ones.
 */
export function NudgeButton({ chore, compact = false, onNudged }: { chore: Chore; compact?: boolean; onNudged?: () => void }) {
  const { me, nameOf, nudgeChore, nudgeSentAt } = useApp()
  const [confirming, setConfirming] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  // Close the confirmation on Escape or a click elsewhere.
  useEffect(() => {
    if (!confirming) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setConfirming(false)
    const onClick = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setConfirming(false)
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [confirming])

  if (!canNudge(chore, me!.id)) return null
  const sentAt = nudgeSentAt(chore.id)
  const name = nameOf(chore.assignedTo!)

  if (sentAt) {
    return (
      <span role="status" className={`text-caption text-ink-muted ${compact ? 'block max-w-[9rem] text-right' : ''}`}>
        Reminder sent today at {formatTime(sentAt)}
      </span>
    )
  }

  return (
    <div ref={box} className="relative">
      <Button
        variant="secondary"
        aria-expanded={confirming}
        aria-label={`Send ${name} a reminder about “${chore.title}”`}
        onClick={() => setConfirming((open) => !open)}
      >
        {compact ? 'Remind' : 'Send a reminder'}
      </Button>
      {confirming && (
        <div className="absolute right-0 top-full z-20 mt-2 flex w-64 flex-col gap-4 rounded-md border border-ink bg-surface p-4 text-left">
          <p className="text-body">{name} gets an anonymous reminder. They won’t see it came from you.</p>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                nudgeChore(chore.id)
                setConfirming(false)
                onNudged?.()
              }}
            >
              Send reminder
            </Button>
            <Button variant="secondary" onClick={() => setConfirming(false)}>Cancel</Button>
          </div>
          <p className="text-caption text-ink-muted">One reminder per chore per day</p>
        </div>
      )}
    </div>
  )
}
