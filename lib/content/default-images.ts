/** The photos shipped with the site. Pure data, shared by the site and the Studio import tool. */
export const defaultHomeImages = {
  hero: [
    '/images/space/hall-olive-island.png',
    '/images/space/facade-blue-hour.png',
    '/images/space/lounge-central-tree.png',
    '/images/space/hall-oak-tables.png',
    '/images/space/bar-brick-tv.png',
    '/images/space/concept-round-bar.png',
  ],
  offer: [
    '/images/coffee.png',
    '/images/beer-wine.png',
    '/images/wine.png',
    '/images/whisky.png',
    '/images/cocktail.png',
    '/images/small-bites.png',
  ],
  concept: { main: '/images/space/hall-oak-tables.png', accent: '/images/space/velvet-chair.png' },
  gallery: [
    '/images/space/lounge-central-tree.png',
    '/images/space/velvet-chair.png',
    '/images/space/whisky-one-seat.png',
    '/images/space/bar-brick-tv.png',
  ],
  nextEvent: '/images/live-music.png',
}

/** Each offer card opens its matching menu category. Same order as `offer.items` in the messages. */
export const defaultOfferCategories = ['coffee', 'beer', 'wine', 'whisky', 'cocktails', 'food']
