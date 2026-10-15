import { defineArrayMember, defineField, defineType } from 'sanity'
import { siteHeaderDefaults } from '../header-defaults'
import { linkFields, linkSubtitle, pageTitle } from './link-fields'

const visibilityTitles: Record<string, string> = {
  all: 'Svugdje',
  desktop: 'Samo na računalu',
  mobile: 'Samo na mobitelu',
}

const navLink = defineArrayMember({
  type: 'object',
  name: 'navLink',
  title: 'Stavka izbornika',
  fields: [
    defineField({ name: 'label', title: 'Naziv u izborniku', type: 'localizedString' }),
    ...linkFields(),
    defineField({
      name: 'visibility',
      title: 'Gdje se prikazuje',
      type: 'string',
      initialValue: 'all',
      options: {
        layout: 'radio',
        list: Object.entries(visibilityTitles).map(([value, title]) => ({ title, value })),
      },
    }),
    defineField({
      name: 'hidden',
      title: 'Privremeno sakrij',
      type: 'boolean',
      initialValue: false,
      description: 'Stavka ostaje spremljena, ali se ne prikazuje.',
    }),
  ],
  preview: {
    select: { label: 'label.hr', kind: 'kind', page: 'page', url: 'url', hidden: 'hidden', visibility: 'visibility' },
    prepare: ({ label, kind, page, url, hidden, visibility }) => ({
      title: label || pageTitle(page) || url || 'Nova stavka',
      subtitle: [hidden ? 'Sakriveno' : null, visibilityTitles[visibility ?? 'all'], linkSubtitle({ kind, page, url })]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})

export const siteHeader = defineType({
  name: 'siteHeader',
  title: 'Zaglavlje',
  type: 'document',
  initialValue: siteHeaderDefaults,
  groups: [
    { name: 'logo', title: 'Logotip', default: true },
    { name: 'nav', title: 'Izbornik' },
    { name: 'cta', title: 'Glavni gumb' },
    { name: 'banner', title: 'Obavijest iznad zaglavlja' },
    { name: 'behaviour', title: 'Ponašanje' },
  ],
  fields: [
    defineField({
      name: 'logo',
      title: 'Logotip',
      type: 'image',
      group: 'logo',
      description: 'Zamijeni ili ukloni sliku da se vrati službeni logotip. Najbolje radi PNG s prozirnom pozadinom ili SVG.',
    }),
    defineField({ name: 'logoAlt', title: 'Opis logotipa (za čitače ekrana)', type: 'string', group: 'logo' }),
    defineField({
      name: 'logoHeight',
      title: 'Visina logotipa na računalu (px)',
      type: 'number',
      group: 'logo',
      description: 'Zadano 40. Na mobitelu se automatski smanjuje.',
      validation: (rule) => rule.min(20).max(120),
    }),
    defineField({
      name: 'hideNav',
      title: 'Ukloni cijeli izbornik',
      type: 'boolean',
      group: 'nav',
      description: 'Sakriva sve stavke, i u zaglavlju i na mobitelu.',
    }),
    defineField({
      name: 'nav',
      title: 'Stavke izbornika',
      type: 'array',
      group: 'nav',
      description:
        'Dodaj novu stavku, obriši postojeću, povuci za redoslijed ili promijeni naziv i odredište. Ako obrišeš sve stavke, prikazuje se zadani izbornik; za potpuno prazan izbornik uključi "Ukloni cijeli izbornik". Na mobitelu je u donjoj traci prvih četiri stavki, ostale su pod "Više".',
      of: [navLink],
    }),
    defineField({
      name: 'cta',
      title: 'Glavni gumb u zaglavlju',
      type: 'object',
      group: 'cta',
      options: { collapsible: false },
      fields: [
        defineField({ name: 'hide', title: 'Ukloni gumb', type: 'boolean' }),
        defineField({
          name: 'label',
          title: 'Natpis',
          type: 'localizedString',
          description: 'Ako je prazno, prikazuje se zadani gumb "Rezervacije".',
        }),
        ...linkFields(),
      ],
    }),
    defineField({
      name: 'announcement',
      title: 'Obavijest iznad zaglavlja',
      type: 'object',
      group: 'banner',
      fields: [
        defineField({ name: 'show', title: 'Prikaži obavijest', type: 'boolean', initialValue: false }),
        defineField({ name: 'text', title: 'Tekst obavijesti', type: 'localizedString' }),
        ...linkFields(),
      ],
      description: 'Uska traka na samom vrhu stranice. Ako odabereš odredište, cijela traka postaje poveznica.',
    }),
    defineField({
      name: 'showLanguageSwitcher',
      title: 'Prikaži izbor jezika',
      type: 'boolean',
      group: 'behaviour',
      initialValue: true,
    }),
    defineField({
      name: 'stickyHeader',
      title: 'Zaglavlje ostaje na vrhu pri skrolanju',
      type: 'boolean',
      group: 'behaviour',
      initialValue: true,
    }),
  ],
  preview: { prepare: () => ({ title: 'Zaglavlje (logotip, izbornik, gumb)' }) },
})
