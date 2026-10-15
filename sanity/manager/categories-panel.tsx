import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { IntentLink } from 'sanity/router'
import { patchEach, useRows } from './data'
import {
  Btn,
  Chip,
  Empty,
  Notice,
  Toolbar,
  cellStyle,
  headCellStyle,
  inputStyle,
  linkButtonStyle,
  tableStyle,
  useRunner,
} from './ui'

type CategoryRow = { name?: string; parentId?: string; orderRank?: string }
type ItemRef = { categoryId?: string }

const categoryProjection = '"name": name.hr, "parentId": parent._ref, orderRank'
const itemProjection = '"categoryId": categoryRef._ref'

const byRank = (a: { orderRank?: string }, b: { orderRank?: string }) => (a.orderRank ?? '~').localeCompare(b.orderRank ?? '~')

export function CategoriesPanel() {
  const categories = useRows<CategoryRow>('menuCategory', categoryProjection)
  const items = useRows<ItemRef>('menuItem', itemProjection)
  const { client, refresh } = categories
  const { busy, notice, run } = useRunner()

  const ordered = useMemo(() => {
    const top = categories.rows.filter((row) => !row.parentId).sort(byRank)
    const known = new Set(categories.rows.map((row) => row.id))
    const orphans = categories.rows.filter((row) => row.parentId && !known.has(row.parentId))
    return top.flatMap((parent) => [
      { row: parent, depth: 0 },
      ...categories.rows
        .filter((row) => row.parentId === parent.id)
        .sort(byRank)
        .map((row) => ({ row, depth: 1 })),
    ]).concat(orphans.map((row) => ({ row, depth: 0 })))
  }, [categories.rows])

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of items.rows) if (item.categoryId) map.set(item.categoryId, (map.get(item.categoryId) ?? 0) + 1)
    return map
  }, [items.rows])

  const childrenOf = (id: string) => categories.rows.filter((row) => row.parentId === id)
  const topLevel = categories.rows.filter((row) => !row.parentId).sort(byRank)

  const setParent = (row: (typeof categories.rows)[number], parentId: string) =>
    run('Nadređena kategorija je promijenjena.', async () => {
      await patchEach(client, [row], () =>
        parentId ? { set: { parent: { _type: 'reference', _ref: parentId, _weak: true } } } : { unset: ['parent'] },
      )
      await refresh()
    })

  const swap = (row: (typeof categories.rows)[number], direction: -1 | 1) => {
    const siblings = categories.rows.filter((other) => (other.parentId ?? '') === (row.parentId ?? '')).sort(byRank)
    const index = siblings.findIndex((other) => other.id === row.id)
    const neighbour = siblings[index + direction]
    if (!neighbour || !row.orderRank || !neighbour.orderRank) return
    void run('Redoslijed je promijenjen.', async () => {
      await patchEach(client, [row, neighbour], (current) => ({
        set: { orderRank: current.id === row.id ? neighbour.orderRank : row.orderRank },
      }))
      await refresh()
    })
  }

  const remove = (row: (typeof categories.rows)[number]) => {
    const itemCount = counts.get(row.id) ?? 0
    const children = childrenOf(row.id)
    const consequences = [
      itemCount > 0 ? `${itemCount} stavki ostaje bez kategorije` : '',
      children.length > 0 ? `${children.length} potkategorija postaje glavna kategorija` : '',
    ].filter(Boolean)
    const message = `Trajno obrisati kategoriju "${row.name ?? 'Bez naziva'}"?${consequences.length ? ` ${consequences.join(', ')}.` : ''}`
    if (!window.confirm(message)) return
    void run('Kategorija je obrisana.', async () => {
      const transaction = client.transaction()
      for (const id of row.ids) transaction.delete(id)
      for (const item of items.rows) {
        if (item.categoryId !== row.id) continue
        for (const id of item.ids) transaction.patch(id, { unset: ['categoryRef'] })
      }
      for (const child of children) for (const id of child.ids) transaction.patch(id, { unset: ['parent'] })
      await transaction.commit()
      await refresh()
    })
  }

  return (
    <div>
      <Toolbar>
        <span style={{ color: 'var(--card-muted-fg-color)', fontSize: 13 }}>
          {categories.rows.length} kategorija. Strelicama mijenjaš redoslijed unutar iste razine.
        </span>
        <IntentLink intent="create" params={{ type: 'menuCategory' }} style={{ ...linkButtonStyle('primary'), marginLeft: 'auto' }}>
          <Plus size={14} aria-hidden="true" />
          Nova kategorija
        </IntentLink>
      </Toolbar>
      <Notice notice={notice} />
      {categories.error ? <Empty>{categories.error}</Empty> : null}
      {categories.loading ? <Empty>Učitavam...</Empty> : null}
      {!categories.loading && !categories.error && ordered.length === 0 ? <Empty>Nema kategorija.</Empty> : null}

      {ordered.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={headCellStyle}>Kategorija</th>
              <th style={headCellStyle}>Nadređena kategorija</th>
              <th style={headCellStyle}>Stavke</th>
              <th style={headCellStyle}>Redoslijed</th>
              <th style={{ ...headCellStyle, textAlign: 'right' }}>Radnje</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map(({ row, depth }) => {
              const hasChildren = childrenOf(row.id).length > 0
              return (
                <tr key={row.id}>
                  <td style={{ ...cellStyle, paddingLeft: 12 + depth * 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <strong>{row.name ?? 'Bez naziva'}</strong>
                      {depth === 0 && hasChildren ? <Chip>{childrenOf(row.id).length} potkategorija</Chip> : null}
                    </div>
                  </td>
                  <td style={cellStyle}>
                    <select
                      aria-label={`Nadređena kategorija: ${row.name ?? ''}`}
                      value={row.parentId ?? ''}
                      disabled={busy || hasChildren}
                      title={hasChildren ? 'Kategorija s potkategorijama ne može postati potkategorija.' : undefined}
                      onChange={(event) => void setParent(row, event.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Glavna kategorija</option>
                      {topLevel
                        .filter((parent) => parent.id !== row.id)
                        .map((parent) => (
                          <option key={parent.id} value={parent.id}>
                            {parent.name ?? 'Bez naziva'}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td style={cellStyle}>{counts.get(row.id) ?? 0}</td>
                  <td style={cellStyle}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <Btn icon={ArrowUp} disabled={busy} onClick={() => swap(row, -1)} aria-label="Pomakni gore" title="Pomakni gore" />
                      <Btn icon={ArrowDown} disabled={busy} onClick={() => swap(row, 1)} aria-label="Pomakni dolje" title="Pomakni dolje" />
                    </div>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: 6 }}>
                      <IntentLink intent="edit" params={{ id: row.id, type: 'menuCategory' }} style={linkButtonStyle()}>
                        <Pencil size={14} aria-hidden="true" />
                        Uredi
                      </IntentLink>
                      <Btn icon={Trash2} tone="danger" disabled={busy} onClick={() => remove(row)} aria-label="Obriši" title="Obriši" />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}
