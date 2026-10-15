import {
  Calendar as CalendarIcon,
  FileText as PageIcon,
  House as HomeIcon,
  Image as ImageIcon,
  MapPin as ContactIcon,
  ShoppingBasket as BasketIcon,
  Tag as TagIcon,
} from 'lucide-react'
import type { StructureBuilder, StructureResolver } from 'sanity/structure'
import { pageRoutes } from './defaults'

const singleton = (S: StructureBuilder, title: string, documentId: string, schemaType: string, icon: typeof HomeIcon) =>
  S.listItem()
    .id(documentId)
    .title(title)
    .icon(icon)
    .child(S.document().schemaType(schemaType).documentId(documentId).title(title))

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Parlament')
    .items([
      S.listItem()
        .title('Večernje sjednice')
        .icon(CalendarIcon)
        .child(
          S.documentTypeList('event')
            .title('Večernje sjednice')
            .defaultOrdering([{ field: 'start', direction: 'desc' }]),
        ),
      S.listItem()
        .title('Meni')
        .icon(BasketIcon)
        .child(
          S.list()
            .title('Meni')
            .items([
              S.listItem().title('Stavke menija').icon(BasketIcon).child(S.documentTypeList('menuItem').title('Stavke menija')),
              S.listItem()
                .title('Kategorije')
                .icon(TagIcon)
                .child(
                  S.documentTypeList('menuCategory')
                    .title('Kategorije')
                    .defaultOrdering([{ field: 'order', direction: 'asc' }]),
                ),
            ]),
        ),
      S.listItem()
        .title('Arhiva (galerija)')
        .icon(ImageIcon)
        .child(
          S.documentTypeList('galleryItem')
            .title('Arhiva (galerija)')
            .defaultOrdering([{ field: 'order', direction: 'asc' }]),
        ),
      S.divider(),
      singleton(S, 'Početna stranica', 'homePage', 'homePage', HomeIcon),
      S.listItem()
        .title('Tekstovi stranica')
        .icon(PageIcon)
        .child(
          S.list()
            .title('Tekstovi stranica')
            .items(
              pageRoutes.map(({ route, title }) =>
                S.listItem()
                  .id(`page-${route}`)
                  .title(title)
                  .icon(PageIcon)
                  .child(
                    S.document()
                      .schemaType('pageContent')
                      .documentId(`page-${route}`)
                      .title(title)
                      .initialValueTemplate(`page-${route}`),
                  ),
              ),
            ),
        ),
      S.divider(),
      singleton(S, 'Kontakt i radno vrijeme', 'siteSettings', 'siteSettings', ContactIcon),
    ])
