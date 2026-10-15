import { Copy, Eye, EyeOff, Pencil, Plus, Send, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { IntentLink } from 'sanity/router'
import { eventStatusOptions } from '../schema-types/event'
import { duplicateRows, patchRows, publishRows, removeRows, useRows, type Doc } from './data'
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

type EventRow = {
  title?: string
  start?: string
  type?: string
  entry?: string
  price?: number
  status?: string
  slug?: string
  performer?: string
  imageUrl?: string
}

const projection =
  '"title": title.hr, start, type, entry, price, status, "slug": slug.current, performer, "imageUrl": image.asset->url'

const typeLabels: Record<string, string> = {
  'live-music': 'Live glazba',
  dj: 'DJ',
  quiz: 'Kviz',
  tasting: 'Degustacija',
  special: 'Posebno',
}

const graceMs = 3 * 60 * 60 * 1000

const dateFormat = new Intl.DateTimeFormat('hr-HR', {
  timeZone: 'Europe/Zagreb',
  weekday: 'short',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

type When = 'upcoming' | 'past' | 'all'

export function EventsPanel() {
  const { client, rows, loading, error, refresh } = useRows<EventRow>('event', projection)
  const { busy, notice, run } = useRunner()
  const [search, setSearch] = useState('')
  const [when, setWhen] = useState<When>('upcoming')
  const [status, setStatus] = useState('all')

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    const now = Date.now()
    return rows
      .filter((row) => {
        const start = row.start ? Date.parse(row.start) : Number.NaN
        if (when === 'upcoming' && !(Number.isNaN(start) || start >= now - graceMs)) return false
        if (when === 'past' && !(start < now - graceMs)) return false
        if (status !== 'all' && (row.status ?? 'scheduled') !== status) return false
        if (!query) return true
        return [row.title, row.performer, row.slug].some((value) => value?.toLowerCase().includes(query))
      })
      .sort((a, b) => {
        const first = a.start ? Date.parse(a.start) : Number.POSITIVE_INFINITY
        const second = b.start ? Date.parse(b.start) : Number.POSITIVE_INFINITY
        return when === 'past' ? second - first : first - second
      })
  }, [rows, search, when, status])

  const { selected, toggle, setAll, clear, allSelected } = useSelection(visible.map((row) => row.id))
  const chosen = visible.filter((row) => selected.has(row.id))
  const drafts = chosen.filter((row) => row.hasDraft)

  const setStatusFor = (targets: typeof chosen, value: string, done: string) =>
    run(done, async () => {
      await patchRows(client, targets, { set: { status: value } })
      await refresh()
    })

  const duplicate = (targets: typeof chosen) =>
    run('Sjednica je duplicirana kao skrivena. Uredi je i promijeni datum.', async () => {
      await duplicateRows(client, targets, (doc) => {
        const title = (doc.title ?? {}) as Doc
        const slug = (doc.slug ?? {}) as Doc
        const suffix = Math.random().toString(36).slice(2, 6)
        return {
          ...doc,
          status: 'hidden',
          title: { ...title, hr: `${String(title.hr ?? 'Sjednica')} (kopija)`, enAuto: true },
          slug: { _type: 'slug', current: `${String(slug.current ?? 'sjednica')}-kopija-${suffix}` },
        }
      })
      await refresh()
    })

  const remove = (targets: typeof chosen) => {
    if (!confirmDelete(targets.length, targets.length === 1 ? 'sjednicu' : 'sjednica')) return
    void run('Obrisano.', async () => {
      await removeRows(client, targets)
      clear()
      await refresh()
    })
  }

  return (
    <div>
      <Toolbar>
        <input
          type="search"
          aria-label="Pretraži sjednice"
          placeholder="Pretraži naslov, izvođača, slug..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={{ ...inputStyle, width: 280 }}
        />
        <select aria-label="Razdoblje" value={when} onChange={(event) => setWhen(event.target.value as When)} style={inputStyle}>
          <option value="upcoming">Nadolazeće i bez datuma</option>
          <option value="past">Prošle</option>
          <option value="all">Sve</option>
        </select>
        <select aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value)} style={inputStyle}>
          <option value="all">Svi statusi</option>
          {eventStatusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.title}
            </option>
          ))}
        </select>
        <span style={{ color: 'var(--card-muted-fg-color)', fontSize: 13 }}>
          {visible.length} od {rows.length}
        </span>
        <IntentLink intent="create" params={{ type: 'event' }} style={{ ...linkButtonStyle('primary'), marginLeft: 'auto' }}>
          <Plus size={14} aria-hidden="true" />
          Nova sjednica
        </IntentLink>
      </Toolbar>

      <BulkBar count={chosen.length} onClear={clear}>
        <Btn icon={EyeOff} disabled={busy} onClick={() => setStatusFor(chosen, 'hidden', 'Skriveno sa stranice.')}>
          Sakrij
        </Btn>
        <Btn icon={Eye} disabled={busy} onClick={() => setStatusFor(chosen, 'scheduled', 'Prikazano na stranici.')}>
          Prikaži
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

      {error ? <Empty>{error}</Empty> : null}
      {loading ? <Empty>Učitavam...</Empty> : null}
      {!loading && !error && visible.length === 0 ? <Empty>Nema sjednica za ovaj prikaz.</Empty> : null}

      {visible.length > 0 ? (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...headCellStyle, width: 36 }}>
                <input type="checkbox" aria-label="Odaberi sve" checked={allSelected} onChange={(event) => setAll(event.target.checked)} />
              </th>
              <th style={headCellStyle}>Sjednica</th>
              <th style={headCellStyle}>Početak</th>
              <th style={headCellStyle}>Vrsta</th>
              <th style={headCellStyle}>Ulaz</th>
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
                    aria-label={`Odaberi ${row.title ?? 'sjednicu'}`}
                    checked={selected.has(row.id)}
                    onChange={() => toggle(row.id)}
                  />
                </td>
                <td style={cellStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {row.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={`${row.imageUrl}?w=80&h=80&fit=crop&auto=format`}
                        alt=""
                        width={40}
                        height={40}
                        style={{ borderRadius: 3, objectFit: 'cover' }}
                      />
                    ) : null}
                    <div style={{ display: 'grid', gap: 2 }}>
                      <strong>{row.title ?? 'Bez naslova'}</strong>
                      <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', color: 'var(--card-muted-fg-color)' }}>
                        {row.performer}
                        {row.hasDraft && !row.hasPublished ? <Chip tone="caution">Nije objavljeno</Chip> : null}
                        {row.hasDraft && row.hasPublished ? <Chip tone="caution">Neobjavljene izmjene</Chip> : null}
                        {!row.slug ? <Chip tone="caution">Nema sluga</Chip> : null}
                      </span>
                    </div>
                  </div>
                </td>
                <td style={cellStyle}>{row.start ? dateFormat.format(new Date(row.start)) : 'Bez datuma'}</td>
                <td style={cellStyle}>{typeLabels[row.type ?? ''] ?? '-'}</td>
                <td style={cellStyle}>
                  {row.entry === 'paid' ? (typeof row.price === 'number' ? `${row.price.toFixed(2)} €` : 'Ulaznica') : row.entry === 'tbc' ? 'Uskoro' : 'Besplatno'}
                </td>
                <td style={cellStyle}>
                  <select
                    aria-label={`Status: ${row.title ?? ''}`}
                    value={row.status ?? 'scheduled'}
                    disabled={busy}
                    onChange={(event) => setStatusFor([row], event.target.value, 'Status je promijenjen.')}
                    style={inputStyle}
                  >
                    {eventStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.title}
                      </option>
                    ))}
                  </select>
                </td>
                <td style={{ ...cellStyle, textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <IntentLink intent="edit" params={{ id: row.id, type: 'event' }} style={linkButtonStyle()}>
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
