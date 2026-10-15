import { CalendarIcon } from '@sanity/icons/Calendar'
import { defineField, defineType } from 'sanity'

export const eventTypeOptions = [
  { title: 'Live glazba', value: 'live-music' },
  { title: 'DJ', value: 'dj' },
  { title: 'Kviz', value: 'quiz' },
  { title: 'Degustacija', value: 'tasting' },
  { title: 'Posebno', value: 'special' },
]

export const eventStatusOptions = [
  { title: 'Zakazano', value: 'scheduled' },
  { title: 'Rasprodano', value: 'sold-out' },
  { title: 'Otkazano', value: 'cancelled' },
  { title: 'Skriveno (ne prikazuje se na stranici)', value: 'hidden' },
]

export const eventEntryOptions = [
  { title: 'Besplatan ulaz', value: 'free' },
  { title: 'Ulaznica', value: 'paid' },
  { title: 'Uskoro potvrđeno', value: 'tbc' },
]

export const event = defineType({
  name: 'event',
  title: 'Večernja sjednica',
  type: 'document',
  icon: CalendarIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Naslov',
      type: 'localizedString',
    }),
    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: (doc) => (doc as { title?: { hr?: string } }).title?.hr ?? '', maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Vrsta programa',
      type: 'string',
      options: { list: eventTypeOptions, layout: 'radio' },
      initialValue: 'live-music',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Opis',
      type: 'localizedText',
    }),
    defineField({
      name: 'performer',
      title: 'Izvođač / voditelj',
      type: 'string',
    }),
    defineField({
      name: 'start',
      title: 'Početak',
      type: 'datetime',
      description: 'Vrijeme se unosi po lokalnom vremenu preglednika.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'end',
      title: 'Kraj (neobavezno)',
      type: 'datetime',
      description: 'Ako se ne unese, program se računa kao 3 sata.',
      validation: (rule) =>
        rule.custom((end, context) => {
          const start = (context.document as { start?: string } | undefined)?.start
          if (!end || !start) return true
          return new Date(end) > new Date(start) || 'Kraj mora biti nakon početka.'
        }),
    }),
    defineField({
      name: 'entry',
      title: 'Ulaz',
      type: 'string',
      options: { list: eventEntryOptions, layout: 'radio' },
      initialValue: 'free',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Cijena ulaznice (EUR)',
      type: 'number',
      hidden: ({ document }) => document?.entry !== 'paid',
      validation: (rule) => rule.min(0).precision(2),
    }),
    defineField({
      name: 'ticketUrl',
      title: 'Poveznica za ulaznice',
      type: 'url',
      validation: (rule) => rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: eventStatusOptions, layout: 'radio' },
      initialValue: 'scheduled',
      validation: (rule) => rule.required(),
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
    { title: 'Početak, najnoviji prvi', name: 'startDesc', by: [{ field: 'start', direction: 'desc' }] },
    { title: 'Početak, najraniji prvi', name: 'startAsc', by: [{ field: 'start', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title.hr', start: 'start', status: 'status', media: 'image' },
    prepare({ title, start, status, media }) {
      const date = start
        ? new Intl.DateTimeFormat('hr-HR', {
            timeZone: 'Europe/Zagreb',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(start))
        : 'Bez datuma'
      const flag = status && status !== 'scheduled' ? ` · ${status}` : ''
      return { title: title ?? 'Bez naslova', subtitle: `${date}${flag}`, media }
    },
  },
})
