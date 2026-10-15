import { defineArrayMember, defineField, defineType } from 'sanity'
import { homePageDefaults } from '../defaults'
import { menuCategoryOptions } from './menu-category'

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

export const homePage = defineType({
  name: 'homePage',
  title: 'Početna stranica',
  type: 'document',
  initialValue: homePageDefaults,
  groups: [
    { name: 'hero', title: 'Naslovni dio', default: true },
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
                name: 'category',
                title: 'Kamo vodi kartica (kategorija menija)',
                type: 'string',
                description: 'Može ostati prazno, tada kartica vodi na cijeli meni.',
                options: { list: menuCategoryOptions },
              }),
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
    section('careers', 'Poziv za posao', 'more', [string('title', 'Naslov'), text('text', 'Tekst')]),
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
