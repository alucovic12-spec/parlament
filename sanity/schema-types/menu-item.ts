import { ShoppingBasket as BasketIcon } from 'lucide-react'
import { defineField, defineType } from 'sanity'
import { menuCategoryOptions } from './menu-category'

export const menuItemStatusOptions = [
  { title: 'Dostupno', value: 'available' },
  { title: 'Trenutno nedostupno', value: 'unavailable' },
  { title: 'Skriveno (ne prikazuje se na stranici)', value: 'hidden' },
]

export const menuTagOptions = [
  { title: 'Novo', value: 'new' },
  { title: 'Popularno', value: 'popular' },
  { title: 'Premium', value: 'premium' },
  { title: 'Bezalkoholno', value: 'nonAlcoholic' },
  { title: 'Vegetarijansko', value: 'vegetarian' },
]

export const menuItem = defineType({
  name: 'menuItem',
  title: 'Stavka menija',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({ name: 'name', title: 'Naziv', type: 'localizedString' }),
    defineField({
      name: 'category',
      title: 'Kategorija',
      type: 'string',
      options: { list: menuCategoryOptions },
    }),
    defineField({ name: 'description', title: 'Opis', type: 'localizedText' }),
    defineField({
      name: 'volume',
      title: 'Količina',
      type: 'string',
      description: 'Npr. 0,2 l, 0,33 l, 4 cl.',
    }),
    defineField({
      name: 'price',
      title: 'Cijena (EUR)',
      type: 'number',
      description: 'Ostaviti prazno dok cijena nije potvrđena.',
      validation: (rule) => rule.min(0).precision(2),
    }),
    defineField({
      name: 'allergens',
      title: 'Alergeni',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'tags',
      title: 'Oznake',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: menuTagOptions, layout: 'grid' },
      validation: (rule) => rule.unique(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: menuItemStatusOptions },
      initialValue: 'available',
    }),
    defineField({
      name: 'image',
      title: 'Slika',
      type: 'image',
      options: { hotspot: true },
      fields: [defineField({ name: 'alt', title: 'Alternativni tekst', type: 'string' })],
    }),
    defineField({
      name: 'placeholder',
      title: 'Probni sadržaj',
      type: 'boolean',
      description: 'Označi dok je unos samo primjer koji treba zamijeniti ili potvrditi.',
      initialValue: false,
    }),
  ],
  orderings: [
    { title: 'Naziv', name: 'nameAsc', by: [{ field: 'name.hr', direction: 'asc' }] },
    {
      title: 'Kategorija',
      name: 'categoryAsc',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'name.hr', direction: 'asc' },
      ],
    },
  ],
  preview: {
    select: { title: 'name.hr', category: 'category', price: 'price', status: 'status', media: 'image' },
    prepare({ title, category, price, status, media }) {
      const categoryTitle = menuCategoryOptions.find((option) => option.value === category)?.title ?? category
      const priceLabel = typeof price === 'number' ? `${price.toFixed(2)} €` : 'cijena nije potvrđena'
      const flag = status && status !== 'available' ? ` · ${status}` : ''
      return { title: title ?? 'Bez naziva', subtitle: `${categoryTitle} · ${priceLabel}${flag}`, media }
    },
  },
})
