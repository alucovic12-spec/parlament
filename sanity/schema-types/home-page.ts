import { defineArrayMember, defineField, defineType } from 'sanity'
import { homePageDefaults, homeSections, layoutTypeName } from '../defaults'
import { linkFields, linkSubtitle } from './link-fields'

const layoutBlocks = homeSections.map(({ key, title }) =>
  defineArrayMember({
    type: 'object',
    name: layoutTypeName(key),
    title,
    fields: [
      defineField({
        name: 'isHidden',
        title: 'Privremeno sakrij ovu sekciju',
        type: 'boolean',
        initialValue: false,
      }),
    ],
    preview: {
      select: { hidden: 'isHidden' },
      prepare: ({ hidden }) => ({ title, subtitle: hidden ? 'Skriveno na stranici' : 'Prikazuje se na stranici' }),
    },
  }),
)

const hideSection = defineField({
  name: 'hideSection',
  title: 'Sakrij cijelu sekciju na stranici',
  type: 'boolean',
  description: 'Uključi ako ne želiš da se ova sekcija uopće prikazuje. Sadržaj ostaje spremljen.',
})

const section = (name: string, title: string, group: string, fields: ReturnType<typeof defineField>[]) =>
  defineField({
    name,
    title,
    type: 'object',
    group,
    options: { collapsible: true, collapsed: false },
    fields: [hideSection, ...fields],
  })

const string = (name: string, title: string) => defineField({ name, title, type: 'localizedString' })
const text = (name: string, title: string) => defineField({ name, title, type: 'localizedText' })
const image = (name: string, title: string, description?: string) =>
  defineField({ name, title, type: 'image', description, options: { hotspot: true } })

const buttonsField = (title: string, description: string) =>
  defineField({
    name: 'buttons',
    title,
    type: 'array',
    description,
    of: [
      defineArrayMember({
        type: 'object',
        name: 'sectionButton',
        title: 'Gumb',
        fields: [
          string('label', 'Natpis'),
          defineField({
            name: 'style',
            title: 'Izgled',
            type: 'string',
            initialValue: 'default',
            options: {
              layout: 'radio',
              list: [
                { title: 'Ispunjen (glavni)', value: 'default' },
                { title: 'S okvirom', value: 'outline' },
                { title: 'Samo tekst', value: 'ghost' },
              ],
            },
          }),
          ...linkFields(),
        ],
        preview: {
          select: { label: 'label.hr', kind: 'kind', page: 'page', url: 'url' },
          prepare: ({ label, kind, page, url }) => ({
            title: label || 'Gumb bez natpisa',
            subtitle: linkSubtitle({ kind, page, url }),
          }),
        },
      }),
    ],
  })

const hideButtons = defineField({
  name: 'hideButtons',
  title: 'Ukloni sve gumbe u ovoj sekciji',
  type: 'boolean',
})

const sectionButtons = [
  hideButtons,
  buttonsField('Gumbi u ovoj sekciji', 'Dodaj, obriši i presloži gumbe. Ako je popis prazan, prikazuju se zadani gumbi.'),
]

const imagePositions = [
  { title: 'Slika desno od teksta', value: 'right' },
  { title: 'Slika lijevo od teksta', value: 'left' },
  { title: 'Slika kao pozadina', value: 'background' },
  { title: 'Samo tekst, bez slike', value: 'none' },
]

const customTones = [
  { title: 'Tamna (zadana)', value: 'base' },
  { title: 'Sumračna', value: 'dusk' },
  { title: 'Crna', value: 'ink' },
  { title: 'Zelena', value: 'green' },
  { title: 'Svijetla (pješčana)', value: 'sand' },
]

export const customBlock = defineArrayMember({
  type: 'object',
  name: layoutTypeName('custom'),
  title: 'Nova sekcija (vlastiti sadržaj)',
  initialValue: { isHidden: false, imagePosition: 'right', tone: 'base' },
  fields: [
    defineField({
      name: 'isHidden',
      title: 'Privremeno sakrij ovu sekciju',
      type: 'boolean',
      initialValue: false,
    }),
    string('eyebrow', 'Nadnaslov'),
    string('title', 'Naslov'),
    text('text', 'Tekst'),
    image('image', 'Slika'),
    defineField({
      name: 'imageAlt',
      title: 'Opis slike za čitače zaslona',
      type: 'string',
      description: 'Kratko opiši što je na slici. Može ostati prazno ako je slika samo ukras.',
    }),
    defineField({
      name: 'imagePosition',
      title: 'Raspored slike',
      type: 'string',
      initialValue: 'right',
      options: { layout: 'radio', list: imagePositions },
    }),
    defineField({
      name: 'tone',
      title: 'Boja pozadine sekcije',
      type: 'string',
      initialValue: 'base',
      options: { list: customTones },
    }),
    defineField({
      name: 'anchor',
      title: 'Sidro za poveznice (neobavezno)',
      type: 'slug',
      description:
        'Npr. "o-nama". Tada gumb ili izbornik mogu voditi na ovu sekciju adresom #o-nama (Vanjska poveznica).',
      options: { source: (_doc, options) => (options.parent as { title?: { hr?: string } })?.title?.hr ?? '' },
    }),
    buttonsField('Gumbi', 'Dodaj koliko god gumba želiš, svaki vodi na stranicu ili vanjsku adresu.'),
  ],
  preview: {
    select: { title: 'title.hr', media: 'image', hidden: 'isHidden', position: 'imagePosition' },
    prepare: ({ title, media, hidden, position }) => ({
      title: title || 'Nova sekcija bez naslova',
      subtitle: `${hidden ? 'Skriveno' : 'Prikazuje se'} · ${imagePositions.find((p) => p.value === position)?.title ?? ''}`,
      media,
    }),
  },
})

export const homePage = defineType({
  name: 'homePage',
  title: 'Početna stranica',
  type: 'document',
  initialValue: homePageDefaults,
  groups: [
    { name: 'layout', title: 'Redoslijed sekcija', default: true },
    { name: 'hero', title: 'Naslovni dio' },
    { name: 'ticker', title: 'Traka s porukama' },
    { name: 'nextEvent', title: 'Sljedeća sjednica' },
    { name: 'offer', title: 'Ponuda' },
    { name: 'concept', title: 'Koncept' },
    { name: 'more', title: 'Arhiva, posao, posjet' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'imported',
      title: 'Sadržaj uvezen',
      type: 'boolean',
      hidden: true,
      description: 'Postavlja alat za uvoz. Kad je uključeno, prazno polje na stranici znači uklonjeno.',
    }),
    defineField({
      name: 'layout',
      title: 'Redoslijed sekcija na početnoj stranici',
      type: 'array',
      group: 'layout',
      description:
        'Povuci sekciju za promjenu mjesta, obriši je da nestane sa stranice ili je privremeno sakrij. Sadržaj ugrađenih sekcija uređuješ u ostalim karticama. Gumbom "Dodaj stavku" možeš dodati i "Novu sekciju" s vlastitim naslovom, tekstom, slikom i gumbima, koliko god puta želiš. Svaka ugrađena sekcija prikazuje se najviše jednom.',
      of: [...layoutBlocks, customBlock],
    }),
    section('hero', 'Naslovni dio', 'hero', [
      string('eyebrow', 'Nadnaslov'),
      string('title', 'Naslov'),
      text('text', 'Tekst'),
      defineField({
        name: 'slides',
        title: 'Slike u naslovnom dijelu',
        type: 'array',
        description: 'Izmjenjuju se jedna za drugom. Svaku možeš zamijeniti, obrisati ili dodati novu.',
        options: { layout: 'grid' },
        of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
      }),
      defineField({
        name: 'hideButtons',
        title: 'Ukloni sve gumbe u naslovnom dijelu',
        type: 'boolean',
      }),
      defineField({
        name: 'buttons',
        title: 'Gumbi u naslovnom dijelu',
        type: 'array',
        description:
          'Dodaj, obriši i presloži gumbe. Ako je popis prazan, prikazuju se zadani gumbi (Rezerviraj, Meni, Program).',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'heroButton',
            title: 'Gumb',
            fields: [
              string('label', 'Natpis'),
              defineField({
                name: 'style',
                title: 'Izgled',
                type: 'string',
                initialValue: 'default',
                options: {
                  layout: 'radio',
                  list: [
                    { title: 'Ispunjen (glavni)', value: 'default' },
                    { title: 'S okvirom', value: 'outline' },
                    { title: 'Samo tekst', value: 'ghost' },
                  ],
                },
              }),
              ...linkFields(),
            ],
            preview: {
              select: { label: 'label.hr', kind: 'kind', page: 'page', url: 'url' },
              prepare: ({ label, kind, page, url }) => ({
                title: label || 'Gumb bez natpisa',
                subtitle: linkSubtitle({ kind, page, url }),
              }),
            },
          }),
        ],
      }),
    ]),
    defineField({
      name: 'ticker',
      title: 'Poruke u traci',
      type: 'array',
      group: 'ticker',
      description: 'Kratke rečenice koje se vrte ispod naslovnog dijela. Ako obrišeš sve, traka nestaje.',
      of: [defineArrayMember({ type: 'localizedString' })],
    }),
    section('nextEvent', 'Sljedeća sjednica', 'nextEvent', [
      string('eyebrow', 'Nadnaslov'),
      string('title', 'Naslov (kad nema najavljenog događaja)'),
      text('text', 'Tekst (kad nema najavljenog događaja)'),
      image('image', 'Slika', 'Slika koju dodaš na samom događaju ima prednost.'),
      ...sectionButtons,
    ]),
    section('offer', 'Ponuda', 'offer', [
      string('eyebrow', 'Nadnaslov'),
      string('title', 'Naslov'),
      text('intro', 'Uvodni tekst'),
      defineField({
        name: 'items',
        title: 'Kartice ponude',
        type: 'array',
        description: 'Možeš dodavati, brisati i mijenjati redoslijed kartica.',
        of: [
          defineArrayMember({
            type: 'object',
            name: 'offerItem',
            fields: [
              string('title', 'Naslov'),
              text('text', 'Opis'),
              image('image', 'Fotografija kartice'),
              defineField({
                name: 'categoryRef',
                title: 'Kamo vodi kartica (kategorija menija)',
                type: 'reference',
                to: [{ type: 'menuCategory' }],
                weak: true,
                description: 'Može ostati prazno, tada kartica vodi na cijeli meni.',
              }),
              defineField({ name: 'category', title: 'Stara kategorija', type: 'string', hidden: true }),
            ],
            preview: { select: { title: 'title.hr', subtitle: 'text.hr', media: 'image' } },
          }),
        ],
      }),
    ]),
    section('concept', 'Koncept', 'concept', [
      string('eyebrow', 'Nadnaslov'),
      string('title', 'Naslov'),
      text('text', 'Tekst'),
      defineField({
        name: 'materials',
        title: 'Materijali koji nose identitet',
        type: 'array',
        of: [defineArrayMember({ type: 'localizedString' })],
      }),
      image('mainImage', 'Velika fotografija'),
      image('accentImage', 'Mala fotografija', 'Kvadratni detalj koji se preklapa s velikom fotografijom.'),
    ]),
    section('gallery', 'Isječak arhive', 'more', [
      string('title', 'Naslov'),
      defineField({
        name: 'tiles',
        title: 'Fotografije u isječku',
        type: 'array',
        description: 'Prikazuju se najviše četiri: velika lijevo, dvije uske u sredini, široka desno.',
        options: { layout: 'grid' },
        validation: (rule) => rule.max(4).warning('Na stranici se prikazuju samo prve četiri.'),
        of: [
          defineArrayMember({
            type: 'object',
            name: 'galleryTile',
            fields: [image('image', 'Fotografija'), string('label', 'Natpis na fotografiji')],
            preview: { select: { title: 'label.hr', media: 'image' } },
          }),
        ],
      }),
    ]),
    section('careers', 'Poziv za posao', 'more', [string('title', 'Naslov'), text('text', 'Tekst'), ...sectionButtons]),
    section('visit', 'Posjet', 'more', [string('title', 'Naslov')]),
    defineField({
      name: 'meta',
      title: 'Naslov i opis za tražilice',
      type: 'object',
      group: 'seo',
      fields: [string('title', 'Naslov'), text('description', 'Opis')],
    }),
  ],
  preview: { prepare: () => ({ title: 'Početna stranica' }) },
})
