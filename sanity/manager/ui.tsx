import type { LucideIcon } from 'lucide-react'
import { useCallback, useMemo, useState, type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react'

export const inputStyle: CSSProperties = {
  font: 'inherit',
  fontSize: 13,
  color: 'var(--card-fg-color)',
  background: 'var(--card-bg-color)',
  border: '1px solid var(--card-border-color)',
  borderRadius: 3,
  padding: '5px 8px',
  minWidth: 0,
}

type Tone = 'default' | 'primary' | 'danger'

const tones: Record<Tone, CSSProperties> = {
  default: {},
  primary: { background: 'var(--card-focus-ring-color)', borderColor: 'var(--card-focus-ring-color)', color: '#fff' },
  danger: { color: 'var(--card-badge-critical-fg-color)', borderColor: 'var(--card-badge-critical-fg-color)' },
}

export const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 12px',
  font: 'inherit',
  fontSize: 13,
  lineHeight: 1.2,
  textDecoration: 'none',
  whiteSpace: 'nowrap',
  borderRadius: 3,
  border: '1px solid var(--card-border-color)',
  background: 'transparent',
  color: 'var(--card-fg-color)',
}

export function Btn({
  icon: Icon,
  tone = 'default',
  children,
  style,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: LucideIcon; tone?: Tone }) {
  return (
    <button
      type="button"
      {...rest}
      style={{
        ...buttonStyle,
        cursor: rest.disabled ? 'not-allowed' : 'pointer',
        opacity: rest.disabled ? 0.5 : 1,
        ...tones[tone],
        ...style,
      }}
    >
      {Icon ? <Icon size={14} aria-hidden="true" /> : null}
      {children}
    </button>
  )
}

export function linkButtonStyle(tone: Tone = 'default'): CSSProperties {
  return { ...buttonStyle, ...tones[tone], cursor: 'pointer' }
}

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderBottom: '1px solid var(--card-border-color)',
      }}
    >
      {children}
    </div>
  )
}

export function BulkBar({ count, onClear, children }: { count: number; onClear: () => void; children: ReactNode }) {
  if (count === 0) return null
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 8,
        padding: '10px 16px',
        background: 'var(--card-badge-primary-bg-color)',
        color: 'var(--card-badge-primary-fg-color)',
        borderBottom: '1px solid var(--card-border-color)',
      }}
    >
      <strong style={{ fontSize: 13, marginRight: 4 }}>Odabrano: {count}</strong>
      {children}
      <Btn onClick={onClear} style={{ marginLeft: 'auto' }}>
        Poništi odabir
      </Btn>
    </div>
  )
}

export function Notice({ notice }: { notice: { text: string; error: boolean } | null }) {
  if (!notice) return null
  return (
    <div
      role="status"
      style={{
        padding: '8px 16px',
        fontSize: 13,
        color: notice.error ? 'var(--card-badge-critical-fg-color)' : 'var(--card-badge-positive-fg-color)',
        background: notice.error ? 'var(--card-badge-critical-bg-color)' : 'var(--card-badge-positive-bg-color)',
      }}
    >
      {notice.text}
    </div>
  )
}

export function Chip({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'caution' }) {
  return (
    <span
      style={{
        fontSize: 11,
        padding: '1px 6px',
        borderRadius: 3,
        whiteSpace: 'nowrap',
        color: tone === 'caution' ? 'var(--card-badge-caution-fg-color)' : 'var(--card-muted-fg-color)',
        background: tone === 'caution' ? 'var(--card-badge-caution-bg-color)' : 'var(--card-badge-default-bg-color)',
      }}
    >
      {children}
    </span>
  )
}

export function Empty({ children }: { children: ReactNode }) {
  return <p style={{ margin: 0, padding: 32, textAlign: 'center', color: 'var(--card-muted-fg-color)' }}>{children}</p>
}

export const tableStyle: CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13 }
export const headCellStyle: CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  fontWeight: 600,
  fontSize: 12,
  color: 'var(--card-muted-fg-color)',
  borderBottom: '1px solid var(--card-border-color)',
  whiteSpace: 'nowrap',
}
export const cellStyle: CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid var(--card-border-color)',
  verticalAlign: 'middle',
}

export function useSelection(allIds: string[]) {
  const [chosen, setChosen] = useState<Set<string>>(new Set())
  const key = allIds.join('|')
  const selected = useMemo(() => new Set([...chosen].filter((id) => allIds.includes(id))), [chosen, key]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback((id: string) => {
    setChosen((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const setAll = useCallback((on: boolean) => setChosen(on ? new Set(allIds) : new Set()), [key]) // eslint-disable-line react-hooks/exhaustive-deps
  const clear = useCallback(() => setChosen(new Set()), [])

  return {
    selected,
    toggle,
    setAll,
    clear,
    allSelected: allIds.length > 0 && allIds.every((id) => selected.has(id)),
  }
}

export function useRunner() {
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<{ text: string; error: boolean } | null>(null)

  const run = useCallback(async (success: string, task: () => Promise<void>) => {
    setBusy(true)
    setNotice(null)
    try {
      await task()
      setNotice({ text: success, error: false })
    } catch (failure) {
      setNotice({ text: failure instanceof Error ? failure.message : 'Radnja nije uspjela.', error: true })
    } finally {
      setBusy(false)
    }
  }, [])

  return { busy, notice, run }
}

export const confirmDelete = (count: number, what: string) =>
  window.confirm(`Trajno obrisati ${count} ${what}? Ovo se ne može poništiti.`)
