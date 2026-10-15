import { Upload as UploadIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { definePlugin, type LayoutProps, useClient } from 'sanity'
import { defaultHomeImages, defaultOfferCategories } from '../lib/content/default-images'
import { venueEvents } from '../lib/events/data'
import { en } from '../lib/i18n/messages/en'
import { hr } from '../lib/i18n/messages/hr'
import { homePageDefaults, pageDefaults, pageRoutes } from './defaults'

type Reference = { _type: 'image'; asset: { _type: 'reference'; _ref: string } }

type StudioClient = ReturnType<typeof useClient>

async function runImport(client: StudioClient, note: (line: string) => void) {
    const uploads = new Map<string, Promise<string>>()
    const upload = (path: string) => {
      const existing = uploads.get(path)
      if (existing) return existing
      const pending = (async () => {
        const response = await fetch(path)
        if (!response.ok) throw new Error(`Slika se ne može učitati: ${path}`)
        const asset = await client.assets.upload('image', await response.blob(), {
          filename: path.split('/').pop(),
        })
        return asset._id
      })()
      uploads.set(path, pending)
      return pending
    }
    const photo = async (path: string): Promise<Reference> => ({
      _type: 'image',
      asset: { _type: 'reference', _ref: await upload(path) },
    })
    const keyedPhoto = async (path: string, index: number) => ({ _key: `photo-${index}`, ...(await photo(path)) })

    try {
      note('Učitavam fotografije u Sanity...')
      const defaults = homePageDefaults()

      const home = {
        _id: 'homePage',
        _type: 'homePage',
        imported: true,
        ...defaults,
        hero: {
          ...defaults.hero,
          slides: await Promise.all(defaultHomeImages.hero.map(keyedPhoto)),
        },
        nextEvent: { ...defaults.nextEvent, image: await photo(defaultHomeImages.nextEvent) },
        offer: {
          ...defaults.offer,
          items: await Promise.all(
            defaults.offer.items.map(async (item, index) => ({
              ...item,
              _type: 'offerItem',
              category: defaultOfferCategories[index],
              image: await photo(defaultHomeImages.offer[index]),
            })),
          ),
        },
        concept: {
          ...defaults.concept,
          mainImage: await photo(defaultHomeImages.concept.main),
          accentImage: await photo(defaultHomeImages.concept.accent),
        },
        gallery: {
          title: defaults.gallery.title,
          tiles: await Promise.all(
            defaultHomeImages.gallery.map(async (path, index) => ({
              _key: `tile-${index}`,
              _type: 'galleryTile',
              image: await photo(path),
              label: { hr: hr.home.gallery.tiles[index] ?? '', en: en.home.gallery.tiles[index] ?? '' },
            })),
          ),
        },
      }

      await client.transaction().createOrReplace(home).delete('drafts.homePage').commit()
      note('Početna stranica: uvezeno.')

      const pages = client.transaction()
      for (const { route } of pageRoutes) {
        pages.createIfNotExists({ _id: `page-${route}`, _type: 'pageContent', ...pageDefaults(route) })
      }
      await pages.commit()
      note('Tekstovi stranica: uvezeno.')

      const existingSlugs = new Set(await client.fetch<string[]>('*[_type == "event"].slug.current'))
      const missing = venueEvents.filter((event) => !existingSlugs.has(event.id))
      for (const event of missing) {
        await client.createIfNotExists({
          _id: `event-${event.id}`,
          _type: 'event',
          title: event.title,
          slug: { _type: 'slug', current: event.id },
          type: event.type,
          description: event.description,
          performer: event.performer ?? undefined,
          start: event.start,
          end: event.end ?? undefined,
          entry: event.entry,
          price: event.price ?? undefined,
          ticketUrl: event.ticketing.url ?? undefined,
          status: event.status,
          placeholder: event.placeholder,
          ...(event.image ? { image: await photo(event.image) } : {}),
        })
      }
      note(`Večernje sjednice: uvezeno ${missing.length}, ostale već postoje.`)
      await client.createIfNotExists({ _id: 'importMarker', _type: 'importMarker' })
      note('Gotovo. Osvježi Studio i otvori Početnu stranicu, Tekstove stranica i Večernje sjednice.')
    } catch (error) {
      note(`Greška: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
    return true
}

let autoImportStarted = false

function AutoImportLayout(props: LayoutProps) {
  const client = useClient({ apiVersion: '2025-01-01' })

  useEffect(() => {
    if (autoImportStarted) return
    autoImportStarted = true
    void (async () => {
      const existing = await client.fetch<{ marker: number; home: number }>(
        '{"marker": count(*[_id == "importMarker"]), "home": count(*[_id in ["homePage", "drafts.homePage"]])}',
      )
      if (existing.marker > 0 || existing.home > 0) return
      await runImport(client, (line) => console.log('[v0] auto import:', line))
    })().catch(() => {
      autoImportStarted = false
    })
  }, [client])

  return props.renderDefault(props)
}

function ImportTool() {
  const client = useClient({ apiVersion: '2025-01-01' })
  const [busy, setBusy] = useState(false)
  const [log, setLog] = useState<string[]>([])

  async function run() {
    const confirmed = window.confirm(
      'Početna stranica u Studiju bit će zamijenjena postojećim sadržajem stranice (tekstovi i fotografije). Nastaviti?',
    )
    if (!confirmed) return
    setBusy(true)
    setLog([])
    await runImport(client, (line) => setLog((lines) => [...lines, line]))
    setBusy(false)
  }

  return (
    <div style={{ maxWidth: 640, padding: 32, display: 'grid', gap: 16 }}>
      <h2 style={{ margin: 0, fontSize: 22 }}>Uvoz postojećeg sadržaja</h2>
      <p style={{ margin: 0, lineHeight: 1.5 }}>
        Prebacuje u Studio sve što se sada prikazuje na stranici: fotografije naslovnog dijela, ponude, koncepta i
        arhive, sve tekstove početne stranice, tekstove ostalih stranica i večernje sjednice. Nakon uvoza možeš sve
        mijenjati, zamijeniti ili obrisati, a prazno polje znači da se ta stvar više ne prikazuje.
      </p>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        style={{ justifySelf: 'start', padding: '10px 18px', fontSize: 15, cursor: busy ? 'wait' : 'pointer' }}
      >
        {busy ? 'Uvozim...' : 'Uvezi postojeći sadržaj'}
      </button>
      {log.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6 }}>
          {log.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export const importPlugin = definePlugin({
  name: 'parlament-import',
  studio: { components: { layout: AutoImportLayout } },
  tools: [{ name: 'import', title: 'Uvoz postojećeg', icon: UploadIcon, component: ImportTool }],
})
