import { LexoRank } from 'lexorank'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useClient } from 'sanity'

export const apiVersion = '2025-01-01'

export type StudioClient = ReturnType<typeof useClient>
export type Doc = Record<string, unknown>
export type PatchOps = { set?: Record<string, unknown>; unset?: string[] }

const draftPrefix = 'drafts.'

export const baseId = (id: string) => (id.startsWith(draftPrefix) ? id.slice(draftPrefix.length) : id)

export const newId = (type: string) => `${type}-${crypto.randomUUID().slice(0, 8)}`

/** A document as the editor sees it: the draft when there is one, with every id that has to be changed together. */
export type Row<T> = T & { id: string; ids: string[]; hasDraft: boolean; hasPublished: boolean }

type Stored<T> = T & { _id: string }

export function useRows<T extends object>(type: string, projection: string) {
  const baseClient = useClient({ apiVersion })
  const client = useMemo(() => baseClient.withConfig({ perspective: 'raw', useCdn: false }), [baseClient])
  const [rows, setRows] = useState<Row<T>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const stored = await client.fetch<Stored<T>[]>(`*[_type == $type]{_id, ${projection}}`, { type })
      const groups = new Map<string, Stored<T>[]>()
      for (const doc of stored) {
        const key = baseId(doc._id)
        groups.set(key, [...(groups.get(key) ?? []), doc])
      }
      setRows(
        [...groups].map(([id, docs]) => {
          const draft = docs.find((doc) => doc._id.startsWith(draftPrefix))
          const published = docs.find((doc) => !doc._id.startsWith(draftPrefix))
          return {
            ...((draft ?? published) as Stored<T>),
            id,
            ids: docs.map((doc) => doc._id),
            hasDraft: Boolean(draft),
            hasPublished: Boolean(published),
          }
        }),
      )
      setError('')
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Podaci se ne mogu učitati.')
    } finally {
      setLoading(false)
    }
  }, [client, type, projection])

  useEffect(() => {
    void refresh()
    let timer: ReturnType<typeof setTimeout> | undefined
    const subscription = client
      .listen('*[_type == $type]', { type }, { includeResult: false, visibility: 'query' })
      .subscribe({
        next: () => {
          clearTimeout(timer)
          timer = setTimeout(() => void refresh(), 400)
        },
        error: () => undefined,
      })
    return () => {
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [client, type, refresh])

  return { client, rows, loading, error, refresh }
}

type Target = { ids: string[] }

export async function removeRows(client: StudioClient, rows: Target[]) {
  const transaction = client.transaction()
  for (const row of rows) for (const id of row.ids) transaction.delete(id)
  await transaction.commit()
}

export async function patchRows(client: StudioClient, rows: Target[], ops: PatchOps) {
  const transaction = client.transaction()
  for (const row of rows) for (const id of row.ids) transaction.patch(id, ops)
  await transaction.commit()
}

export async function patchEach<R extends Target>(
  client: StudioClient,
  rows: R[],
  build: (row: R, index: number) => PatchOps | null,
) {
  const transaction = client.transaction()
  rows.forEach((row, index) => {
    const ops = build(row, index)
    if (ops) for (const id of row.ids) transaction.patch(id, ops)
  })
  await transaction.commit()
}

const systemFields = ['_rev', '_createdAt', '_updatedAt']

function withoutSystemFields(doc: Doc) {
  const copy: Doc = { ...doc }
  for (const field of systemFields) delete copy[field]
  return copy
}

/** Turns drafts into published documents, which is what the website reads. */
export async function publishRows(client: StudioClient, rows: (Target & { id: string; hasDraft: boolean })[]) {
  const drafts = rows.filter((row) => row.hasDraft)
  if (drafts.length === 0) return 0
  const docs = await client.getDocuments<Doc>(drafts.map((row) => `${draftPrefix}${row.id}`))
  const transaction = client.transaction()
  let count = 0
  for (const doc of docs) {
    if (!doc) continue
    transaction.createOrReplace({ ...withoutSystemFields(doc), _id: baseId(doc._id) } as { _id: string; _type: string })
    transaction.delete(doc._id)
    count += 1
  }
  await transaction.commit()
  return count
}

export async function duplicateRows(
  client: StudioClient,
  rows: (Target & { id: string; hasDraft: boolean })[],
  adjust: (doc: Doc, index: number) => Doc,
) {
  const docs = await client.getDocuments<Doc>(rows.map((row) => (row.hasDraft ? `${draftPrefix}${row.id}` : row.id)))
  const transaction = client.transaction()
  docs.forEach((doc, index) => {
    if (!doc) return
    const copy = adjust(withoutSystemFields(doc), index)
    transaction.create({ ...copy, _id: newId(String(doc._type)), _type: String(doc._type) })
  })
  await transaction.commit()
}

/** A LexoRank that sorts between `before` and `after`. Throws when the two are equal. */
export function rankBetween(before?: string, after?: string) {
  if (before && after) return LexoRank.parse(before).between(LexoRank.parse(after)).toString()
  if (before) return LexoRank.parse(before).genNext().toString()
  if (after) return LexoRank.parse(after).genPrev().toString()
  return LexoRank.middle().toString()
}

export function sequentialRanks(count: number) {
  let rank = LexoRank.min().genNext().genNext()
  return Array.from({ length: count }, () => {
    rank = rank.genNext().genNext()
    return rank.toString()
  })
}
