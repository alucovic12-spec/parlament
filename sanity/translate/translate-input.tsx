import { Button, Flex, Stack, Text } from '@sanity/ui'
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
    <Stack gap={3}>
      {props.renderDefault(props)}
      <Flex align="center" gap={3} wrap="wrap">
        <Button
          icon={Languages}
          text="Prevedi na engleski"
          mode="ghost"
          fontSize={1}
          padding={2}
          disabled={busy || !value?.hr?.trim()}
          onClick={translate}
        />
        {message ? (
          <Text size={1} muted={!failed} style={failed ? { color: 'var(--card-badge-critical-fg-color)' } : undefined}>
            {message}
          </Text>
        ) : null}
      </Flex>
    </Stack>
  )
}
