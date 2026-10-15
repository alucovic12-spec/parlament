import { defineField, defineType } from 'sanity'

export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Fotografija arhive',
  type: 'document',
  initialValue: { category: 'atmosphere', order: 100 },
  fields: [
    defineField({
      name: 'image',
      title: 'Fotografija',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
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
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
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
    defineField({
      name: 'order',
      title: 'Redoslijed',
      type: 'number',
      description: 'Manji broj se prikazuje ranije.',
    }),
  ],
  orderings: [
    { title: 'Redoslijed', name: 'order', by: [{ field: 'order', direction: 'asc' }] },
    { title: 'Najnovije', name: 'newest', by: [{ field: '_createdAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'caption.hr', subtitle: 'category', media: 'image' },
    prepare: ({ title, subtitle, media }) => ({ title: title ?? 'Bez opisa', subtitle, media }),
  },
})
