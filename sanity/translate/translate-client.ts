export type TranslateItem = { key: string; text: string }

export type TranslateContext = {
  documentType?: string
  field?: string
  siblings?: { label: string; text: string }[]
}

type LocalizedPair = { hr?: unknown; en?: unknown; enAuto?: unknown }

export type LocalizedTarget = { path: string; hr: string; en: string; enAuto: boolean }

const isLocalizedPair = (node: unknown): node is LocalizedPair => {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return false
  const keys = Object.keys(node).filter((key) => key !== '_type' && key !== '_key')
  return keys.length > 0 && keys.every((key) => key === 'hr' || key === 'en' || key === 'enAuto')
}

/** Every `{ hr, en }` pair in a document, with a Sanity patch path to each. */
export function collectLocalized(document: unknown, basePath = ''): LocalizedTarget[] {
  const found: LocalizedTarget[] = []

  const walk = (node: unknown, path: string) => {
    if (Array.isArray(node)) {
      node.forEach((item, index) => {
        const key = item && typeof item === 'object' ? (item as { _key?: string })._key : undefined
        walk(item, key ? `${path}[_key=="${key}"]` : `${path}[${index}]`)
      })
      return
    }
    if (!node || typeof node !== 'object') return
    if (isLocalizedPair(node)) {
      found.push({
        path,
        hr: typeof node.hr === 'string' ? node.hr : '',
        en: typeof node.en === 'string' ? node.en : '',
        enAuto: node.enAuto === true,
      })
      return
    }
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('_') || key === 'asset' || key === 'slug') continue
      walk(child, path ? `${path}.${key}` : key)
    }
  }

  walk(document, basePath)
  return found
}

/** A few Croatian texts from the same document so the model can pick the right meaning. */
export function collectSiblings(document: unknown) {
  return collectLocalized(document)
    .filter((target) => target.hr.trim())
    .slice(0, 12)
    .map((target) => ({ label: target.path || 'field', text: target.hr.trim().slice(0, 240) }))
}

export async function translateToEnglish(
  token: string | undefined,
  items: TranslateItem[],
  context: TranslateContext,
): Promise<Record<string, string>> {
  if (!token) throw new Error('Nema Sanity prijave za prijevod. Odjavi se i prijavi ponovno u Studio.')

  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, context }),
  })
  if (response.status === 401) throw new Error('Prijava za prijevod nije valjana. Odjavi se i prijavi ponovno.')
  if (!response.ok) throw new Error('Prijevod trenutno nije uspio. Pokušaj ponovno.')

  const { translations } = (await response.json()) as { translations: TranslateItem[] }
  return Object.fromEntries(translations.map((entry) => [entry.key, entry.text]))
}
