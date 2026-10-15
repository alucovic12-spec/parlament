import { CalendarIcon } from '@sanity/icons/Calendar'
import { BasketIcon } from '@sanity/icons/Basket'
import { TagIcon } from '@sanity/icons/Tag'
import type { StructureResolver } from 'sanity/structure'

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
      S.divider(),
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
    ])
