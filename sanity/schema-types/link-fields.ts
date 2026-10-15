import { defineField } from 'sanity'
import { routeKeys } from '../../lib/i18n/config'
import { hr } from '../../lib/i18n/messages/hr'

const pageKeys = ['home', ...routeKeys] as const

export const pageOptions = pageKeys.map((value) => ({ title: hr.nav[value], value }))

type LinkParent = { kind?: string } | undefined

/** Where something points: a page of this site or any external address. Reused by the header, buttons and banner. */
export const linkFields = () => [
  defineField({
    name: 'kind',
    title: 'Kamo vodi',
    type: 'string',
    initialValue: 'page',
    options: {
      layout: 'radio',
      list: [
        { title: 'Stranica na ovoj web stranici', value: 'page' },
        { title: 'Vanjska poveznica, e-mail ili telefon', value: 'external' },
      ],
    },
  }),
  defineField({
    name: 'page',
    title: 'Stranica',
    type: 'string',
    options: { list: pageOptions },
    hidden: ({ parent }) => (parent as LinkParent)?.kind === 'external',
  }),
  defineField({
    name: 'url',
    title: 'Adresa',
    type: 'string',
    description: 'Npr. https://instagram.com/parlament, mailto:info@parlament.bar ili tel:+38567000000.',
    hidden: ({ parent }) => (parent as LinkParent)?.kind !== 'external',
    validation: (rule) =>
      rule.custom((value, context) => {
        if ((context.parent as LinkParent)?.kind !== 'external' || !value) return true
        return /^(https?:\/\/|mailto:|tel:|\/|#)/.test(value) || 'Adresa mora počinjati s https://, mailto:, tel:, / ili #.'
      }),
  }),
  defineField({
    name: 'newTab',
    title: 'Otvori u novoj kartici',
    type: 'boolean',
    initialValue: false,
  }),
]

export function linkSubtitle(link: { kind?: string; page?: string; url?: string }) {
  if (link.kind === 'external') return link.url || 'Vanjska poveznica bez adrese'
  const page = pageOptions.find((option) => option.value === link.page)
  return page ? `Stranica: ${page.title}` : 'Odredište nije odabrano'
}

export function pageTitle(page?: string) {
  return pageOptions.find((option) => option.value === page)?.title
}
