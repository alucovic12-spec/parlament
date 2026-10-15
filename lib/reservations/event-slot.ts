import { reservationTimeZone } from './config'

/** Local (Zagreb) date and start time of an event, in the shapes the reservations table stores. */
export function eventSlot(startIso: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: reservationTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(startIso))
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '00'
  return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` }
}
