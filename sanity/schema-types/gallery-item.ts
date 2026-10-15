import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list'
import { defineField, defineType } from 'sanity'

export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Fotografija arhive',
  type: 'document',
  fields: [
    orderRankField({ type: 'galleryItem', newItemPosition: 'before' }),
    defineField({
      name: 'image',
      title: 'Fotografija',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'category',
      title: 'Kategorija',
      type: 'string',
      options: {
        list: [
          { title: 'Interijer', value: 'interior' },
          { title: 'Atmosfera', value: 'atmosphere' },
          { title: 'Pića i hrana', value: 'drinks' },
          { title: 'Događanja', value: 'events' },
          { title: 'Osoblje', value: 'team' },
          { title: 'Gostovanja i večeri', value: 'guest' },
        ],
      },
    }),
    defineField({
      name: 'caption',
      title: 'Opis ispod fotografije',
      type: 'localizedString',
    }),
    defineField({
      name: 'alt',
      title: 'Opis za slabovidne (alt)',
      type: 'localizedString',
      description: 'Kratko opiši što je na fotografiji. Ako ostane prazno, koristi se opis ispod fotografije.',
    }),
    defineField({ name: 'order', title: 'Stari redoslijed', type: 'number', hidden: true }),
  ],
  orderings: [
    orderRankOrdering,
    { title: 'Najnovije', name: 'newest', by: [{ field: '_createdAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'caption.hr', subtitle: 'category', media: 'image' },
    prepare: ({ title, subtitle, media }) => ({ title: title ?? 'Bez opisa', subtitle, media }),
  },
})
