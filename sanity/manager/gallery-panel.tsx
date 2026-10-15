import { ImagePlus, Pencil, Send, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState, type DragEvent } from 'react'
import { IntentLink } from 'sanity/router'
import { galleryCategoryOptions } from '../schema-types/gallery-item'
import { newId, patchEach, patchRows, publishRows, rankBetween, removeRows, sequentialRanks, useRows } from './data'
import {
  BulkBar,
  Btn,
  Chip,
  Empty,
  Notice,
  Toolbar,
  confirmDelete,
  inputStyle,
  linkButtonStyle,
  useRunner,
  useSelection,
} from './ui'

type PhotoRow = { category?: string; caption?: string; imageUrl?: string; orderRank?: string }

const projection = 'category, "caption": caption.hr, "imageUrl": image.asset->url, orderRank'

const byRank = (a: { orderRank?: string }, b: { orderRank?: string }) => (a.orderRank ?? '~').localeCompare(b.orderRank ?? '~')

export function GalleryPanel() {
  const { client, rows, loading, error, refresh } = useRows<PhotoRow>('galleryItem', projection)
  const { busy, notice, run } = useRunner()
  const [category, setCategory] = useState('all')
  const [uploadCategory, setUploadCategory] = useState('atmosphere')
  const [progress, setProgress] = useState('')
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [dropping, setDropping] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const sorted = useMemo(() => [...rows].sort(byRank), [rows])
  const visible = useMemo(() => sorted.filter((row) => category === 'all' || row.category === category), [sorted, category])
  const { selected, toggle, setAll, clear, allSelected } = useSelection(visible.map((row) => row.id))
  const chosen = visible.filter((row) => selected.has(row.id))
  const drafts = chosen.filter((row) => row.hasDraft)

  const upload = (files: File[]) => {
    const images = files.filter((file) => file.type.startsWith('image/'))
    if (images.length === 0) return
    void run(`Dodano fotografija: ${images.length}.`, async () => {
      let last = sorted[sorted.length - 1]?.orderRank
      for (const [index, file] of images.entries()) {
        setProgress(`Učitavam ${index + 1} od ${images.length}...`)
        const asset = await client.assets.upload('image', file, { filename: file.name })
        last = rankBetween(last, undefined)
        await client.create({
          _id: newId('galleryItem'),
          _type: 'galleryItem',
          image: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } },
          category: uploadCategory,
          orderRank: last,
        })
      }
      setProgress('')
      await refresh()
    }).finally(() => setProgress(''))
  }

  const move = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return
    const order = visible.map((row) => row.id)
    const without = sorted.filter((row) => row.id !== draggedId)
    const targetIndex = without.findIndex((row) => row.id === targetId)
    const fromIndex = order.indexOf(draggedId)
    const toIndex = order.indexOf(targetId)
    const insertAt = fromIndex < toIndex ? targetIndex + 1 : targetIndex
    const dragged = sorted.find((row) => row.id === draggedId)
    if (!dragged || targetIndex < 0) return

    void run('Redoslijed je spremljen.', async () => {
      try {
        const before = without[insertAt - 1]?.orderRank
        const after = without[insertAt]?.orderRank
        if (without.some((row) => !row.orderRank)) throw new Error('missing rank')
        await patchRows(client, [dragged], { set: { orderRank: rankBetween(before, after) } })
      } catch {
        const reordered = [...without.slice(0, insertAt), dragged, ...without.slice(insertAt)]
        const ranks = sequentialRanks(reordered.length)
        await patchEach(client, reordered, (row, index) => ({ set: { orderRank: ranks[index] } }))
      }
      await refresh()
    })
  }

  const setCategoryFor = (targets: typeof chosen, value: string) =>
    run('Kategorija je promijenjena.', async () => {
      await patchRows(client, targets, { set: { category: value } })
      await refresh()
    })

  const remove = (targets: typeof chosen) => {
    if (!confirmDelete(targets.length, targets.length === 1 ? 'fotografiju' : 'fotografija')) return
    void run('Obrisano.', async () => {
      await removeRows(client, targets)
      clear()
      await refresh()
    })
  }

  const onDropFiles = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDropping(false)
    upload([...event.dataTransfer.files])
  }

  return (
    <div>
      <Toolbar>
        <select aria-label="Filtriraj po kategoriji" value={category} onChange={(event) => setCategory(event.target.value)} style={inputStyle}>
          <option value="all">Sve kategorije</option>
          {galleryCategoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.title}
            </option>
          ))}
        </select>
        <span style={{ color: 'var(--card-muted-fg-color)', fontSize: 13 }}>
          {visible.length} od {rows.length}. Povuci fotografiju na novo mjesto za redoslijed.
        </span>
      </Toolbar>

      <div
        onDragOver={(event) => {
          if (event.dataTransfer.types.includes('Files')) {
            event.preventDefault()
            setDropping(true)
          }
        }}
        onDragLeave={() => setDropping(false)}
        onDrop={onDropFiles}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
          margin: 16,
          padding: 16,
          border: `2px dashed ${dropping ? 'var(--card-focus-ring-color)' : 'var(--card-border-color)'}`,
          borderRadius: 6,
        }}
      >
        <ImagePlus size={20} aria-hidden="true" />
        <span style={{ fontSize: 13 }}>Povuci fotografije ovdje ili</span>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            upload([...(event.target.files ?? [])])
            event.target.value = ''
          }}
        />
        <Btn tone="primary" disabled={busy} onClick={() => fileInput.current?.click()}>
          Odaberi fotografije
        </Btn>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          Kategorija novih
          <select value={uploadCategory} onChange={(event) => setUploadCategory(event.target.value)} style={inputStyle}>
            {galleryCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.title}
              </option>
            ))}
          </select>
        </label>
        {progress ? <span style={{ fontSize: 13, color: 'var(--card-muted-fg-color)' }}>{progress}</span> : null}
      </div>

      <BulkBar count={chosen.length} onClear={clear}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          Kategorija
          <select
            aria-label="Postavi kategoriju odabranima"
            defaultValue=""
            disabled={busy}
            onChange={(event) => {
              if (event.target.value) void setCategoryFor(chosen, event.target.value)
              event.target.value = ''
            }}
            style={inputStyle}
          >
            <option value="">Odaberi...</option>
            {galleryCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.title}
              </option>
            ))}
          </select>
        </label>
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
        <Btn icon={Trash2} tone="danger" disabled={busy} onClick={() => remove(chosen)}>
          Obriši
        </Btn>
      </BulkBar>
      <Notice notice={notice} />

      {error ? <Empty>{error}</Empty> : null}
      {loading ? <Empty>Učitavam...</Empty> : null}
      {!loading && !error && visible.length === 0 ? <Empty>Arhiva je prazna. Dodaj prve fotografije iznad.</Empty> : null}

      {visible.length > 0 ? (
        <>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px 8px', fontSize: 13 }}>
            <input type="checkbox" checked={allSelected} onChange={(event) => setAll(event.target.checked)} />
            Odaberi sve
          </label>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: '0 16px 24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {visible.map((row) => (
              <li
                key={row.id}
                draggable={category === 'all'}
                onDragStart={() => setDragId(row.id)}
                onDragOver={(event) => {
                  if (dragId) {
                    event.preventDefault()
                    setOverId(row.id)
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  if (dragId) move(dragId, row.id)
                  setDragId(null)
                  setOverId(null)
                }}
                onDragEnd={() => {
                  setDragId(null)
                  setOverId(null)
                }}
                style={{
                  display: 'grid',
                  gap: 8,
                  padding: 8,
                  borderRadius: 6,
                  border: `1px solid ${overId === row.id && dragId ? 'var(--card-focus-ring-color)' : 'var(--card-border-color)'}`,
                  opacity: dragId === row.id ? 0.4 : 1,
                  background: selected.has(row.id) ? 'var(--card-badge-default-bg-color)' : undefined,
                  cursor: category === 'all' ? 'grab' : 'default',
                }}
              >
                <div style={{ position: 'relative' }}>
                  {row.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`${row.imageUrl}?w=400&h=300&fit=crop&auto=format`}
                      alt={row.caption ?? 'Fotografija arhive'}
                      width={400}
                      height={300}
                      draggable={false}
                      style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 4, display: 'block' }}
                    />
                  ) : (
                    <div style={{ height: 140, display: 'grid', placeItems: 'center', color: 'var(--card-muted-fg-color)' }}>Bez slike</div>
                  )}
                  <input
                    type="checkbox"
                    aria-label={`Odaberi ${row.caption ?? 'fotografiju'}`}
                    checked={selected.has(row.id)}
                    onChange={() => toggle(row.id)}
                    style={{ position: 'absolute', top: 8, left: 8, width: 18, height: 18 }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', fontSize: 12 }}>
                  <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.caption ?? 'Bez opisa'}
                  </span>
                  {row.hasDraft ? <Chip tone="caution">{row.hasPublished ? 'Neobjavljeno' : 'Nije objavljeno'}</Chip> : null}
                </div>
                <select
                  aria-label={`Kategorija: ${row.caption ?? 'fotografija'}`}
                  value={row.category ?? ''}
                  disabled={busy}
                  onChange={(event) => setCategoryFor([row], event.target.value)}
                  style={inputStyle}
                >
                  <option value="">Bez kategorije</option>
                  {galleryCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.title}
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 6 }}>
                  <IntentLink intent="edit" params={{ id: row.id, type: 'galleryItem' }} style={{ ...linkButtonStyle(), flex: 1, justifyContent: 'center' }}>
                    <Pencil size={14} aria-hidden="true" />
                    Uredi
                  </IntentLink>
                  <Btn icon={Trash2} tone="danger" disabled={busy} onClick={() => remove([row])} aria-label="Obriši" title="Obriši" />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}
