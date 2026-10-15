import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { Tag as TagIcon } from 'lucide-react'
import { defineField, defineType } from 'sanity'

export const menuCategory = defineType({
  name: 'menuCategory',
  title: 'Kategorija menija',
  type: 'document',
  icon: TagIcon,
  fields: [
    orderRankField({ type: 'menuCategory' }),
    defineField({ name: 'name', title: 'Naziv', type: 'localizedString' }),
    defineField({
      name: 'parent',
      title: 'Nadređena kategorija',
      type: 'reference',
      to: [{ type: 'menuCategory' }],
      weak: true,
      description:
        'Ostavi prazno da ovo bude glavna kategorija. Odaberi kategoriju da ova postane njezina potkategorija.',
      options: {
        disableNew: true,
        filter: ({ document }) => ({
          filter: '_type == "menuCategory" && !defined(parent) && _id != $id',
          params: { id: String(document._id ?? '').replace(/^drafts\./, '') },
        }),
      },
    }),
    defineField({
      name: 'image',
      title: 'Slika kategorije',
      type: 'image',
      options: { hotspot: true },
      description: 'Prikazuje se uz naziv kategorije na javnom meniju. Nije obavezna.',
    }),
    defineField({ name: 'key', title: 'Identifikator', type: 'string', hidden: true }),
    defineField({ name: 'order', title: 'Stari redoslijed', type: 'number', hidden: true }),
  ],
  orderings: [orderRankOrdering],
  preview: {
    select: { title: 'name.hr', parent: 'parent.name.hr' },
    prepare: ({ title, parent }) => ({
      title: title ?? 'Bez naziva',
      subtitle: parent ? `Potkategorija: ${parent}` : 'Glavna kategorija',
    }),
  },
})
