import { defineField, defineType } from 'sanity'

const url = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'url',
    validation: (rule) => rule.uri({ scheme: ['https'] }),
  })

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Kontakt i radno vrijeme',
  type: 'document',
  initialValue: { email: 'info@parlament.bar' },
  fields: [
    defineField({
      name: 'address',
      title: 'Adresa',
      type: 'string',
      description: 'Prikazuje se u podnožju, na početnoj i u strukturiranim podacima za Google.',
    }),
    defineField({ name: 'phone', title: 'Telefon', type: 'string' }),
    defineField({ name: 'email', title: 'E-mail', type: 'string', validation: (rule) => rule.email() }),
    defineField({
      name: 'hours',
      title: 'Radno vrijeme',
      type: 'localizedText',
      description: 'Svaki red se prikazuje u novom retku, npr. "Pon–Čet 08–23".',
    }),
    url('instagram', 'Instagram'),
    url('facebook', 'Facebook'),
    url('tiktok', 'TikTok'),
  ],
  preview: { prepare: () => ({ title: 'Kontakt i radno vrijeme' }) },
})
