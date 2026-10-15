import { Languages } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type ObjectInputProps, set, useClient, useFormValue } from 'sanity'
import { collectSiblings, translateToEnglish } from './translate-client'

type Pair = { hr?: string; en?: string; enAuto?: boolean } | undefined

const autoDelayMs = 1400

export function TranslateInput(props: ObjectInputProps) {
  const client = useClient({ apiVersion: '2025-01-01' })
  const document = useFormValue([]) as { _type?: string } | undefined
  const value = props.value as Pair
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [failed, setFailed] = useState(false)

  const latest = useRef(value)
  const lastHr = useRef(value?.hr)
  const lastAuto = useRef(value?.enAuto ? value.en : undefined)
  const requestId = useRef(0)

  useEffect(() => {
    latest.current = value
  })

  const field = props.path.filter((segment): segment is string => typeof segment === 'string').join(' > ')

  const translate = useCallback(async () => {
    const hr = latest.current?.hr?.trim()
    if (!hr) return
    const id = ++requestId.current
    setBusy(true)
    setFailed(false)
    setMessage('Prevodim na engleski...')
    try {
      const result = await translateToEnglish(
        client.config().token,
        [{ key: 'field', text: hr }],
        { documentType: document?._type, field, siblings: collectSiblings(document) },
      )
      if (id !== requestId.current) return
      lastAuto.current = result.field
      lastHr.current = latest.current?.hr
      props.onChange([set(result.field, ['en']), set(true, ['enAuto'])])
      setMessage('Engleski je preveden automatski. Slobodno ga ispravi.')
    } catch (error) {
      if (id !== requestId.current) return
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'Prijevod nije uspio.')
    } finally {
      if (id === requestId.current) setBusy(false)
    }
  }, [client, document, field, props])

  // Croatian changed: translate again unless the editor wrote the English text by hand.
  useEffect(() => {
    const hr = value?.hr?.trim()
    if (!hr || hr === lastHr.current?.trim()) return
    const mayOverwrite = !value?.en || value?.enAuto === true
    if (!mayOverwrite) {
      lastHr.current = value?.hr
      return
    }
    const timer = setTimeout(translate, autoDelayMs)
    return () => clearTimeout(timer)
  }, [value?.hr, value?.en, value?.enAuto, translate])

  // English edited by hand: stop overwriting it automatically.
  useEffect(() => {
    if (value?.enAuto && lastAuto.current !== undefined && value.en !== lastAuto.current) {
      lastAuto.current = undefined
      props.onChange(set(false, ['enAuto']))
    }
  }, [value?.en, value?.enAuto, props])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {props.renderDefault(props)}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={busy || !value?.hr?.trim()}
          onClick={translate}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            font: 'inherit',
            fontSize: 13,
            color: 'var(--card-fg-color)',
            background: 'transparent',
            border: '1px solid var(--card-border-color)',
            borderRadius: 3,
            cursor: busy || !value?.hr?.trim() ? 'not-allowed' : 'pointer',
            opacity: busy || !value?.hr?.trim() ? 0.5 : 1,
          }}
        >
          <Languages size={14} aria-hidden="true" />
          Prevedi na engleski
        </button>
        {message ? (
          <span
            role="status"
            style={{
              fontSize: 13,
              color: failed ? 'var(--card-badge-critical-fg-color)' : 'var(--card-muted-fg-color)',
            }}
          >
            {message}
          </span>
        ) : null}
      </div>
    </div>
  )
}
