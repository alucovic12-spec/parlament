import { Copy, Eye, EyeOff, FolderInput, Pencil, Percent, Plus, Send, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { IntentLink } from 'sanity/router'
import { LexoRank } from 'lexorank'
import { menuItemStatusOptions } from '../schema-types/menu-item'
import { duplicateRows, patchEach, patchRows, publishRows, removeRows, useRows, type Doc } from './data'
import {
  BulkBar,
  Btn,
  Chip,
  Empty,
  Notice,
  Toolbar,
  cellStyle,
  confirmDelete,
  headCellStyle,
  inputStyle,
  linkButtonStyle,
  tableStyle,
  useRunner,
  useSelection,
} from './ui'

type ItemRow = {
  name?: string
  categoryId?: string
  volume?: string
  price?: number
  status?: string
  imageUrl?: string
  orderRank?: string
  placeholder?: boolean
}

type CategoryRow = { name?: string; parentId?: string; orderRank?: string }

const itemProjection =
  '"name": name.hr, "categoryId": categoryRef._ref, volume, price, status, "imageUrl": image.asset->url, orderRank, placeholder'
const categoryProjection = '"name": name.hr, "parentId": parent._ref, orderRank'

const byRank = (a: { orderRank?: string }, b: { orderRank?: string }) => (a.orderRank ?? '~').localeCompare(b.orderRank ?? '~')

export function MenuPanel() {
  const items = useRows<ItemRow>('menuItem', itemProjection)
  const categories = useRows<CategoryRow>('menuCategory', categoryProjection)
  const { client, refresh } = items
  const { busy, notice, run } = useRunner()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')
  const [flag, setFlag] = useState('all')
  const [target, setTarget] = useState('')

  const options = useMemo(() => {
    const top = categories.rows.filter((row) => !row.parentId).sort(byRank)
    return top.flatMap((parent) => [
      { id: parent.id, label: parent.name ?? 'Bez naziva', parentId: undefined as string | undefined },
      ...categories.rows
        .filter((row) => row.parentId === parent.id)
        .sort(byRank)
        .map((child) => ({ id: child.id, label: `${parent.name ?? ''} › ${child.name ?? 'Bez naziva'}`, parentId: parent.id })),
    ])
  }, [categories.rows])

  const labelOf = useMemo(() => new Map(options.map((option) => [option.id, option.label])), [options])
  const position = useMemo(() => new Map(options.map((option, index) => [option.id, index])), [options])

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    const inCategory = new Set(
      category === 'all' || category === 'none'
        ? []
        : options.filter((option) => option.id === category || option.parentId === category).map((option) => option.id),
    )
    return items.rows
      .filter((row) => {
        if (category === 'none' && row.categoryId && labelOf.has(row.categoryId)) return false
        if (category !== 'all' && category !== 'none' && !inCategory.has(row.categoryId ?? '')) return false
        if (status !== 'all' && (row.status ?? 'available') !== status) return false
        if (flag === 'noPrice' && typeof row.price === 'number') return false
        if (flag === 'placeholder' && !row.placeholder) return false
        if (flag === 'draft' && !row.hasDraft) return false
        if (!query) return true
        return [row.name, row.volume].some((value) => value?.toLowerCase().includes(query))
      })
      .sort((a, b) => {
        const first = position.get(a.categoryId ?? '') ?? Number.MAX_SAFE_INTEGER
        const second = position.get(b.categoryId ?? '') ?? Number.MAX_SAFE_INTEGER
        return first - second || byRank(a, b)
      })
  }, [items.rows, search, category, status, flag, options, labelOf, position])

  const { selected, toggle, setAll, clear, allSelected } = useSelection(visible.map((row) => row.id))
  const chosen = visible.filter((row) => selected.has(row.id))
  const drafts = chosen.filter((row) => row.hasDraft)

  const patch = (targets: typeof chosen, ops: Parameters<typeof patchRows>[2], done: string) =>
    run(done, async () => {
      await patchRows(client, targets, ops)
      await refresh()
    })

  const moveTo = (targets: typeof chosen, categoryId: string) =>
    patch(
      targets,
      categoryId
        ? { set: { categoryRef: { _type: 'reference', _ref: categoryId, _weak: true } } }
        : { unset: ['categoryRef'] },
      'Kategorija je promijenjena.',
    )

  const changePrices = () => {
    const answer = window.prompt('Promjena cijena u postocima za odabrane stavke (npr. 5 ili -10):')
    if (answer === null) return
    const percent = Number(answer.replace(',', '.'))
    if (!Number.isFinite(percent) || percent === 0) return
    void run('Cijene su promijenjene.', async () => {
      await patchEach(client, chosen, (row) =>
        typeof row.price === 'number' ? { set: { price: Math.round(row.price * (1 + percent / 100) * 100) / 100 } } : null,
      )
      await refresh()
    })
  }

  const duplicate = (targets: typeof chosen) =>
    run('Stavka je duplicirana. Kopija je skrivena dok je ne urediš i prikažeš.', async () => {
      await duplicateRows(client, targets, (doc) => {
        const name = (doc.name ?? {}) as Doc
        const rank = typeof doc.orderRank === 'string' ? LexoRank.parse(doc.orderRank).genNext().toString() : undefined
        return {
          ...doc,
          status: 'hidden',
          name: { ...name, hr: `${String(name.hr ?? 'Stavka')} (kopija)`, enAuto: true },
          ...(rank ? { orderRank: rank } : {}),
        }
      })
      await refresh()
    })

  const remove = (targets: typeof chosen) => {
    if (!confirmDelete(targets.length, targets.length === 1 ? 'stavku menija' : 'stavki menija')) return
    void run('Obrisano.', async () => {
      await removeRows(client, targets)
      clear()
      await refresh()
    })
  }

  const categorySelect = (value: string, onChange: (next: string) => void, label: string) => (
    <select aria-label={label} value={value} disabled={busy} onChange={(event) => onChange(event.target.value)} style={{ ...inputStyle, maxWidth: 220 }}>
      <option value="">Bez kategorije</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  )

  return (
    <div>
      <Toolbar>
        <input
          type="search"
          aria-label="Pretraži stavke menija"
          placeholder="Pretraži naziv ili količinu..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ ...inputStyle, width: 240 }}
        />
        <select aria-label="Kategorija" value={category} onChange={(event) => setCategory(event.target.value)} style={inputStyle}>
          <option value="all">Sve kategorije</option>
          <option value="none">Bez kategorije</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <select aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value)} style={inputStyle}>
          <option value="all">Svi statusi</option>
          {menuItemStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.title}
            </option>
          ))}
        </select>
        <select aria-label="Posebni prikaz" value={flag} onChange={(event) => setFlag(event.target.value)} style={inputStyle}>
          <option value="all">Sve stavke</option>
          <option value="noPrice">Bez cijene</option>
          <option value="placeholder">Probni sadržaj</option>
          <option value="draft">Neobjavljeno</option>
        </select>
        <span style={{ color: 'var(--card-muted-fg-color)', fontSize: 13 }}>
          {visible.length} od {items.rows.length}
        </span>
        <IntentLink intent="create" params={{ type: 'menuItem' }} style={{ ...linkButtonStyle('primary'), marginLeft: 'auto' }}>
          <Plus size={14} aria-hidden="true" />
          Nova stavka
        </IntentLink>
      </Toolbar>

      <BulkBar count={chosen.length} onClear={clear}>
        <span style={{ display: 'inline-flex', gap: 6 }}>
          {categorySelect(target, setTarget, 'Premjesti u kategoriju')}
          <Btn icon={FolderInput} disabled={busy} onClick={() => moveTo(chosen, target)}>
            Premjesti
          </Btn>
        </span>
        <Btn icon={EyeOff} disabled={busy} onClick={() => patch(chosen, { set: { status: 'hidden' } }, 'Skriveno sa stranice.')}>
          Sakrij
        </Btn>
        <Btn icon={Eye} disabled={busy} onClick={() => patch(chosen, { set: { status: 'available' } }, 'Prikazano na stranici.')}>
          Prikaži
        </Btn>
        <Btn icon={Percent} disabled={busy} onClick={changePrices}>
          Promijeni cijene
        </Btn>
        {drafts.length > 0 ? (
          <Btn
            icon={Send}
            disabled={busy}
            onClick={() =>
              run('Objavljeno.', async () => {
                await publishRows(client, chosen)
                await refresh()
              })
            }
          >
            Objavi ({drafts.length})
          </Btn>
        ) : null}
        <Btn icon={Copy} disabled={busy} onClick={() => duplicate(chosen)}>
          Dupliciraj
        </Btn>
        <Btn icon={Trash2} tone="danger" disabled={busy} onClick={() => remove(chosen)}>
          Obriši
        </Btn>
      </BulkBar>
      <Notice notice={notice} />

      {items.error ? <Empty>{items.error}</Empty> : null}
      {items.loading ? <Empty>Učitavam...</Empty> : null}
      {!items.loading && !items.error && visible.length === 0 ? <Empty>Nema stavki za ovaj prikaz.</Empty> : null}

      {visible.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...headCellStyle, width: 36 }}>
                <input type="checkbox" aria-label="Odaberi sve" checked={allSelected} onChange={(event) => setAll(event.target.checked)} />
              </th>
              <th style={headCellStyle}>Stavka</th>
              <th style={headCellStyle}>Kategorija</th>
              <th style={headCellStyle}>Količina</th>
              <th style={headCellStyle}>Cijena (EUR)</th>
              <th style={headCellStyle}>Status</th>
              <th style={{ ...headCellStyle, textAlign: 'right' }}>Radnje</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} style={{ background: selected.has(row.id) ? 'var(--card-badge-default-bg-color)' : undefined }}>
                <td style={cellStyle}>
                  <input
                    type="checkbox"
                    aria-label={`Odaberi ${row.name ?? 'stavku'}`}
                    checked={selected.has(row.id)}
                    onChange={() => toggle(row.id)}
                  />
                </td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <strong>{row.name ?? 'Bez naziva'}</strong>
                    {row.placeholder ? <Chip>Probno</Chip> : null}
                    {row.hasDraft && !row.hasPublished ? <Chip tone="caution">Nije objavljeno</Chip> : null}
                    {row.hasDraft && row.hasPublished ? <Chip tone="caution">Neobjavljene izmjene</Chip> : null}
                  </div>
                </td>
                <td style={cellStyle}>
                  {categorySelect(row.categoryId && labelOf.has(row.categoryId) ? row.categoryId : '', (next) => moveTo([row], next), `Kategorija: ${row.name ?? ''}`)}
                </td>
                <td style={cellStyle}>{row.volume ?? '-'}</td>
                <td style={cellStyle}>
                  <input
                    key={`${row.id}-${row.price ?? ''}`}
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    aria-label={`Cijena: ${row.name ?? ''}`}
                    defaultValue={row.price ?? ''}
                    placeholder="bez cijene"
                    disabled={busy}
                    style={{ ...inputStyle, width: 96 }}
                    onBlur={(event) => {
                      const raw = event.target.value.trim()
                      const next = raw === '' ? undefined : Number(raw)
                      if (next === row.price || (next !== undefined && !Number.isFinite(next))) return
                      void patch([row], next === undefined ? { unset: ['price'] } : { set: { price: next } }, 'Cijena je spremljena.')
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur()
                    }}
                  />
                </td>
                <td style={cellStyle}>
                  <select
                    aria-label={`Status: ${row.name ?? ''}`}
                    value={row.status ?? 'available'}
                    disabled={busy}
                    onChange={(event) => patch([row], { set: { status: event.target.value } }, 'Status je promijenjen.')}
                    style={inputStyle}
                  >
                    {menuItemStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <IntentLink intent="edit" params={{ id: row.id, type: 'menuItem' }} style={linkButtonStyle()}>
                      <Pencil size={14} aria-hidden="true" />
                      Uredi
                    </IntentLink>
                    <Btn icon={Copy} disabled={busy} onClick={() => duplicate([row])} aria-label="Dupliciraj" title="Dupliciraj" />
                    <Btn icon={Trash2} tone="danger" disabled={busy} onClick={() => remove([row])} aria-label="Obriši" title="Obriši" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}
