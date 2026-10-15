import { TagIcon } from '@sanity/icons/Tag'
import { defineField, defineType } from 'sanity'

export const menuCategoryOptions = [
  { title: 'Kava', value: 'coffee' },
  { title: 'Topli napitci', value: 'hot-drinks' },
  { title: 'Bezalkoholna pića', value: 'soft-drinks' },
  { title: 'Pivo', value: 'beer' },
  { title: 'Vino', value: 'wine' },
  { title: 'Žestoka pića', value: 'spirits' },
  { title: 'Viski', value: 'whisky' },
  { title: 'Kokteli', value: 'cocktails' },
  { title: 'Hrana', value: 'food' },
  { title: 'Posebna ponuda', value: 'special' },
  { title: 'Piće tjedna', value: 'drink-of-the-week' },
]

export const menuCategory = defineType({
  name: 'menuCategory',
  title: 'Kategorija menija',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'key',
      title: 'Identifikator',
      type: 'string',
      description: 'Povezuje kategoriju s kodom stranice (sidra, poveznice). Ne mijenjati nakon objave.',
      options: { list: menuCategoryOptions },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'name', title: 'Naziv', type: 'localizedString' }),
    defineField({
      name: 'order',
      title: 'Redoslijed',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  orderings: [{ title: 'Redoslijed', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'name.hr', subtitle: 'key' },
  },
})
