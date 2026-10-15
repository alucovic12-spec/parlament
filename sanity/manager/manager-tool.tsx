import { useState } from 'react'
import { CategoriesPanel } from './categories-panel'
import { EventsPanel } from './events-panel'
import { GalleryPanel } from './gallery-panel'
import { MenuPanel } from './menu-panel'

const tabs = [
  { id: 'events', label: 'Večernje sjednice', Panel: EventsPanel },
  { id: 'menu', label: 'Stavke menija', Panel: MenuPanel },
  { id: 'categories', label: 'Kategorije menija', Panel: CategoriesPanel },
  { id: 'gallery', label: 'Arhiva fotografija', Panel: GalleryPanel },
] as const

export function ManagerTool() {
  const [active, setActive] = useState<(typeof tabs)[number]['id']>('events')
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        color: 'var(--card-fg-color)',
        background: 'var(--card-bg-color)',
        fontFamily: 'inherit',
      }}
    >
      <div
        role="tablist"
        aria-label="Upravitelj sadržaja"
        style={{ display: 'flex', gap: 4, padding: '8px 16px 0', borderBottom: '1px solid var(--card-border-color)', overflowX: 'auto' }}
      >
        {tabs.map((tab) => {
          const selected = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(tab.id)}
              style={{
                padding: '10px 16px',
                font: 'inherit',
                fontSize: 14,
                fontWeight: selected ? 600 : 400,
                color: 'var(--card-fg-color)',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${selected ? 'var(--card-focus-ring-color)' : 'transparent'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div role="tabpanel" style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <current.Panel key={current.id} />
      </div>
    </div>
  )
}
