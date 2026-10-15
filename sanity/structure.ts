import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list'
import {
  Calendar as CalendarIcon,
  FileText as PageIcon,
  House as HomeIcon,
  Image as ImageIcon,
  MapPin as ContactIcon,
  PanelTop as HeaderIcon,
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

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Parlament')
    .items([
      S.listItem()
        .title('Program')
        .icon(CalendarIcon)
        .child(
          S.list()
            .title('Program')
            .items([
              S.listItem()
                .title('Nadolazeće i nedavne')
                .icon(CalendarIcon)
                .child(
                  S.documentList()
                    .title('Nadolazeće i nedavne')
                    .filter('_type == "event" && dateTime(start) > dateTime(now()) - 60*60*24*30')
                    .defaultOrdering([{ field: 'start', direction: 'asc' }]),
                ),
              S.listItem()
                .title('Arhiva sjednica')
                .icon(CalendarIcon)
                .child(
                  S.documentList()
                    .title('Arhiva sjednica')
                    .filter('_type == "event" && dateTime(start) <= dateTime(now()) - 60*60*24*30')
                    .defaultOrdering([{ field: 'start', direction: 'desc' }]),
                ),
              S.listItem()
                .title('Sve sjednice')
                .icon(CalendarIcon)
                .child(
                  S.documentTypeList('event')
                    .title('Sve sjednice')
                    .defaultOrdering([{ field: 'start', direction: 'desc' }]),
                ),
            ]),
        ),
      S.listItem()
        .title('Meni')
        .icon(BasketIcon)
        .child(
          S.list()
            .title('Meni')
            .items([
              orderableDocumentListDeskItem({
                type: 'menuCategory',
                id: 'orderable-menu-categories',
                title: 'Kategorije i potkategorije (povuci za redoslijed)',
                icon: TagIcon,
                S,
                context,
              }),
              S.listItem()
                .title('Stavke po kategoriji (povuci za redoslijed)')
                .icon(BasketIcon)
                .child(
                  S.documentList()
                    .title('Odaberi kategoriju')
                    .filter('_type == "menuCategory"')
                    .defaultOrdering([{ field: 'orderRank', direction: 'asc' }])
                    .child((categoryId) =>
                      S.component()
                        .id(`items-${categoryId}`)
                        .title('Stavke')
                        .child(
                          orderableDocumentListDeskItem({
                            type: 'menuItem',
                            id: `orderable-menu-items-${categoryId}`,
                            title: 'Stavke',
                            filter: 'categoryRef._ref == $category',
                            params: { category: categoryId.replace(/^drafts\./, '') },
                            icon: BasketIcon,
                            S,
                            context,
                          }).child as never,
                        ),
                    ),
                ),
              S.listItem()
                .title('Sve stavke menija')
                .icon(BasketIcon)
                .child(S.documentTypeList('menuItem').title('Sve stavke menija')),
            ]),
        ),
      orderableDocumentListDeskItem({
        type: 'galleryItem',
        id: 'orderable-gallery',
        title: 'Arhiva (galerija, povuci za redoslijed)',
        icon: ImageIcon,
        S,
        context,
      }),
      S.divider(),
      singleton(S, 'Zaglavlje (logotip, izbornik, gumb)', 'siteHeader', 'siteHeader', HeaderIcon),
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
