import { defineField, defineType } from 'sanity'
import { reservedSlugs } from '../../lib/i18n/config'
import { customBlock } from './home-page'

export const customPage = defineType({
  name: 'customPage',
  title: 'Nova stranica',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Naslov stranice',
      type: 'localizedString',
      description: 'Glavni naslov stranice i naslov u tražilicama.',
    }),
    defineField({
      name: 'slug',
      title: 'Adresa stranice',
      type: 'slug',
      description:
        'Npr. "o-nama" daje stranicu na /o-nama i /en/o-nama. Klikni "Generate" za automatski prijedlog iz naslova. Nakon objave ne mijenjaj adresu jer stare poveznice prestaju raditi.',
      options: { source: 'title.hr', maxLength: 60 },
      validation: (rule) =>
        rule.required().custom((value) => {
          const slug = value?.current
          if (!slug) return true
          if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
            return 'Koristi samo mala slova bez kvačica, brojeve i crtice (npr. o-nama).'
          }
          return reservedSlugs.includes(slug) || 'Ova adresa je već zauzeta stranicom na webu. Odaberi drugu.'
        }),
    }),
    defineField({
      name: 'description',
      title: 'Opis za tražilice',
      type: 'localizedText',
    }),
    defineField({
      name: 'intro',
      title: 'Uvodni tekst',
      type: 'localizedText',
      description: 'Rečenica ispod naslova.',
    }),
    defineField({
      name: 'sections',
      title: 'Sekcije stranice',
      type: 'array',
      description: 'Dodaj sekcije s tekstom, slikom i gumbima. Povuci ih za promjenu redoslijeda.',
      of: [customBlock],
    }),
  ],
  preview: {
    select: { title: 'title.hr', slug: 'slug.current' },
    prepare: ({ title, slug }) => ({ title: title || 'Nova stranica bez naslova', subtitle: slug ? `/${slug}` : 'Adresa nije postavljena' }),
  },
})
