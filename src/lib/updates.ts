import { useApp } from '../data/store'
import { isMoneyActivity } from './activity'
import { useFlag } from './flags'

/** Your unread notifications in this room, newest first. IOU items are left out while the money flag is off. */
export function useUnreadUpdates() {
  const { state, me, room } = useApp()
  const moneyOn = useFlag('money')
  if (!me || !room) return []
  return state.activity.filter(
    (a) =>
      a.roomId === room.id &&
      a.notify.includes(me.id) &&
      !a.readBy.includes(me.id) &&
      (moneyOn || !isMoneyActivity(a)),
  )
}
