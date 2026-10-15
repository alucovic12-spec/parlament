import { defineField, defineType } from 'sanity'

const isContactPage = ({ document }: { document?: { _id?: string } }) =>
  document?._id?.replace('drafts.', '') === 'page-contact'

export const pageContent = defineType({
  name: 'pageContent',
  title: 'Tekst stranice',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Naslov stranice',
      type: 'localizedString',
      description: 'Glavni naslov stranice i naslov u tražilicama.',
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
      hidden: isContactPage,
    }),
  ],
  preview: {
    select: { title: 'title.hr' },
    prepare: ({ title }) => ({ title: title ?? 'Tekst stranice' }),
  },
})
