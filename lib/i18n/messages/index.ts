import type { Locale } from '../config'
import { en } from './en'
import { hr, type Messages } from './hr'

const messages: Record<Locale, Messages> = { hr, en }

export function getMessages(locale: Locale): Messages {
  return messages[locale]
}

export type { Messages }
