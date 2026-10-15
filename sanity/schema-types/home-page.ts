import { defineArrayMember, defineField, defineType } from 'sanity'
import { homePageDefaults } from '../defaults'

const section = (name: string, title: string, group: string, fields: ReturnType<typeof defineField>[]) =>
  defineField({
    name,
    title,
    type: 'object',
    group,
    options: { collapsible: true, collapsed: false },
    fields,
  })

const string = (name: string, title: string) => defineField({ name, title, type: 'localizedString' })
const text = (name: string, title: string) => defineField({ name, title, type: 'localizedText' })
const image = (name: string, title: string, description?: string) =>
  defineField({ name, title, type: 'image', description, options: { hotspot: true } })
const imageList = (name: string, title: string, description: string, max?: number) =>
  defineField({
    name,
    title,
    type: 'array',
    description,
    validation: max ? (rule) => rule.max(max) : undefined,
    options: { layout: 'grid' },
    of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
  })

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
    section('hero', 'Naslovni dio', 'hero', [
      string('eyebrow', 'Nadnaslov'),
      string('title', 'Naslov'),
      text('text', 'Tekst'),
      imageList(
        'slides',
        'Slike u naslovnom dijelu',
        'Izmjenjuju se jedna za drugom. Ako ostane prazno, prikazuju se standardne fotografije prostora. Najbolje su široke fotografije.',
      ),
    ]),
    defineField({
      name: 'ticker',
      title: 'Poruke u traci',
      type: 'array',
      group: 'ticker',
      description: 'Kratke rečenice koje se vrte ispod naslovnog dijela.',
      of: [defineArrayMember({ type: 'localizedString' })],
    }),
    section('nextEvent', 'Kad nema najavljenog događaja', 'nextEvent', [
      string('eyebrow', 'Nadnaslov'),
      string('title', 'Naslov'),
      text('text', 'Tekst'),
      image(
        'image',
        'Slika sljedeće sjednice',
        'Prikazuje se kad najavljeni događaj nema vlastitu sliku. Slika koju dodaš na samom događaju ima prednost.',
      ),
    ]),
    defineField({
      name: 'offer',
      title: 'Ponuda',
      type: 'object',
      group: 'offer',
      options: { collapsible: true, collapsed: false },
      fields: [
        string('eyebrow', 'Nadnaslov'),
        string('title', 'Naslov'),
        text('intro', 'Uvodni tekst'),
        defineField({
          name: 'items',
          title: 'Kartice ponude',
          type: 'array',
          description:
            'Redoslijed je fiksan: kave, pivo, vino, whisky, kokteli, hrana. Svaka kartica može imati vlastitu fotografiju; ako je ne dodaš, ostaje standardna.',
          validation: (rule) => rule.max(6),
          of: [
            defineArrayMember({
              type: 'object',
              name: 'offerItem',
              fields: [string('title', 'Naslov'), text('text', 'Opis'), image('image', 'Fotografija kartice')],
              preview: { select: { title: 'title.hr', subtitle: 'text.hr', media: 'image' } },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'concept',
      title: 'Koncept',
      type: 'object',
      group: 'concept',
      options: { collapsible: true, collapsed: false },
      fields: [
        string('eyebrow', 'Nadnaslov'),
        string('title', 'Naslov'),
        text('text', 'Tekst'),
        defineField({
          name: 'materials',
          title: 'Materijali koji nose identitet',
          type: 'array',
          of: [defineArrayMember({ type: 'localizedString' })],
        }),
        image('mainImage', 'Velika fotografija', 'Široka fotografija prostora.'),
        image('accentImage', 'Mala fotografija', 'Kvadratni detalj koji se preklapa s velikom fotografijom.'),
      ],
    }),
    section('gallery', 'Isječak arhive', 'more', [
      string('title', 'Naslov'),
      imageList(
        'images',
        'Fotografije u isječku',
        'Četiri polja redom: velika lijevo, dva uska u sredini, široka desno. Prazno polje zadržava standardnu fotografiju.',
        4,
      ),
    ]),
    section('careers', 'Poziv za posao', 'more', [string('title', 'Naslov'), text('text', 'Tekst')]),
    section('visit', 'Posjet', 'more', [string('title', 'Naslov')]),
    section('meta', 'Naslov i opis za tražilice', 'seo', [string('title', 'Naslov'), text('description', 'Opis')]),
  ],
  preview: { prepare: () => ({ title: 'Početna stranica' }) },
})
