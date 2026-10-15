import { Languages } from 'lucide-react'
import { useState } from 'react'
import { type DocumentActionComponent, useClient, useDocumentOperation } from 'sanity'
import { collectLocalized, collectSiblings, translateToEnglish } from './translate-client'

const chunkSize = 30

function createAction(overwrite: boolean): DocumentActionComponent {
  const TranslateAction: DocumentActionComponent = (props) => {
    const client = useClient({ apiVersion: '2025-01-01' })
    const { patch } = useDocumentOperation(props.id, props.type)
    const [busy, setBusy] = useState(false)
    const source = props.draft ?? props.published

    return {
      icon: Languages,
      disabled: !source || busy,
      label: busy
        ? 'Prevodim...'
        : overwrite
          ? 'Prevedi sve na engleski (prepiši)'
          : 'Prevedi prazno na engleski',
      title: overwrite
        ? 'Prevodi sav hrvatski tekst u ovom dokumentu i prepisuje postojeći engleski.'
        : 'Prevodi samo ono što još nema engleski (ili je ranije bilo automatski prevedeno).',
      onHandle: async () => {
        if (!source) return
        if (overwrite && !window.confirm('Ovo prepisuje sav engleski tekst u ovom dokumentu. Nastaviti?')) {
          props.onComplete()
          return
        }

        const targets = collectLocalized(source).filter(
          (target) => target.hr.trim() && (overwrite || !target.en.trim() || target.enAuto),
        )
        if (targets.length === 0) {
          window.alert('Nema ničega za prevesti.')
          props.onComplete()
          return
        }

        setBusy(true)
        try {
          const context = { documentType: props.type, siblings: collectSiblings(source) }
          const patches: { set: Record<string, unknown> }[] = []

          for (let start = 0; start < targets.length; start += chunkSize) {
            const chunk = targets.slice(start, start + chunkSize)
            const result = await translateToEnglish(
              client.config().token,
              chunk.map((target, index) => ({ key: String(start + index), text: target.hr.trim() })),
              context,
            )
            chunk.forEach((target, index) => {
              const text = result[String(start + index)]
              if (!text) return
              const base = target.path ? `${target.path}.` : ''
              patches.push({ set: { [`${base}en`]: text, [`${base}enAuto`]: true } })
            })
          }

          patch.execute(patches, props.published ?? undefined)
        } catch (error) {
          window.alert(error instanceof Error ? error.message : 'Prijevod nije uspio.')
        } finally {
          setBusy(false)
          props.onComplete()
        }
      },
    }
  }
  return TranslateAction
}

export const translateMissingAction = createAction(false)
export const translateAllAction = createAction(true)
