import type { MenuCategory, MenuItem } from './types'

/**
 * Temporary structured menu content. Names are generic placeholders, prices are intentionally
 * `null` and allergens are empty until the venue confirms them. Replaced by database rows in the admin phase.
 */

export const menuCategories: MenuCategory[] = [
  { id: 'special', name: { hr: 'Posebna ponuda', en: 'Special offer' } },
  { id: 'drink-of-the-week', name: { hr: 'Piće tjedna', en: 'Drink of the week' } },
  { id: 'coffee', name: { hr: 'Kave', en: 'Coffee' } },
  { id: 'hot-drinks', name: { hr: 'Topli napitci', en: 'Hot drinks' } },
  { id: 'soft-drinks', name: { hr: 'Bezalkoholna pića', en: 'Soft drinks' } },
  { id: 'beer', name: { hr: 'Pivo', en: 'Beer' } },
  { id: 'wine', name: { hr: 'Vino i pjenušci', en: 'Wine and sparkling' } },
  { id: 'spirits', name: { hr: 'Žestoka pića', en: 'Spirits' } },
  { id: 'whisky', name: { hr: 'Whisky', en: 'Whisky' } },
  { id: 'cocktails', name: { hr: 'Kokteli', en: 'Cocktails' } },
  { id: 'food', name: { hr: 'Hrana i mali zalogaji', en: 'Food and small plates' } },
]

type Draft = Omit<MenuItem, 'price' | 'allergens' | 'status' | 'placeholder' | 'tags'> &
  Partial<Pick<MenuItem, 'tags'>>

const draft = (item: Draft): MenuItem => ({
  tags: [],
  ...item,
  price: null,
  allergens: [],
  status: 'available',
  placeholder: true,
})

export const menuItems: MenuItem[] = [
  draft({ id: 'espresso', category: 'coffee', name: { hr: 'Espresso', en: 'Espresso' } }),
  draft({ id: 'cappuccino', category: 'coffee', name: { hr: 'Cappuccino', en: 'Cappuccino' } }),
  draft({ id: 'macchiato', category: 'coffee', name: { hr: 'Macchiato', en: 'Macchiato' } }),

  draft({
    id: 'tea',
    category: 'hot-drinks',
    name: { hr: 'Čaj', en: 'Tea' },
    description: { hr: 'Odabrani čajevi.', en: 'A selection of teas.' },
    tags: ['nonAlcoholic', 'vegetarian'],
  }),
  draft({
    id: 'hot-chocolate',
    category: 'hot-drinks',
    name: { hr: 'Topla čokolada', en: 'Hot chocolate' },
    tags: ['nonAlcoholic', 'vegetarian'],
  }),

  draft({
    id: 'soft-drinks',
    category: 'soft-drinks',
    name: { hr: 'Gazirani sokovi', en: 'Soft drinks' },
    tags: ['nonAlcoholic'],
  }),
  draft({
    id: 'water',
    category: 'soft-drinks',
    name: { hr: 'Voda', en: 'Water' },
    description: { hr: 'Gazirana i negazirana.', en: 'Still and sparkling.' },
    tags: ['nonAlcoholic'],
  }),
  draft({
    id: 'juice',
    category: 'soft-drinks',
    name: { hr: 'Prirodni sok', en: 'Fruit juice' },
    tags: ['nonAlcoholic', 'vegetarian'],
  }),

  draft({
    id: 'draught-beer',
    category: 'beer',
    name: { hr: 'Točeno pivo', en: 'Draught beer' },
    tags: ['popular'],
  }),
  draft({ id: 'craft-beer', category: 'beer', name: { hr: 'Craft pivo', en: 'Craft beer' } }),

  draft({ id: 'white-wine', category: 'wine', name: { hr: 'Bijelo vino', en: 'White wine' } }),
  draft({ id: 'red-wine', category: 'wine', name: { hr: 'Crno vino', en: 'Red wine' } }),
  draft({ id: 'sparkling', category: 'wine', name: { hr: 'Pjenušac', en: 'Sparkling wine' } }),

  draft({ id: 'rakija', category: 'spirits', name: { hr: 'Rakija', en: 'Rakija' } }),
  draft({ id: 'gin', category: 'spirits', name: { hr: 'Gin', en: 'Gin' } }),
  draft({ id: 'rum', category: 'spirits', name: { hr: 'Rum', en: 'Rum' } }),

  draft({
    id: 'single-malt',
    category: 'whisky',
    name: { hr: 'Single malt', en: 'Single malt' },
    tags: ['premium'],
  }),
  draft({ id: 'blended-whisky', category: 'whisky', name: { hr: 'Blended whisky', en: 'Blended whisky' } }),

  draft({ id: 'negroni', category: 'cocktails', name: { hr: 'Negroni', en: 'Negroni' } }),
  draft({
    id: 'old-fashioned',
    category: 'cocktails',
    name: { hr: 'Old Fashioned', en: 'Old Fashioned' },
    tags: ['popular'],
  }),
  draft({ id: 'aperol-spritz', category: 'cocktails', name: { hr: 'Aperol Spritz', en: 'Aperol Spritz' } }),
  draft({
    id: 'espresso-martini',
    category: 'cocktails',
    name: { hr: 'Espresso Martini', en: 'Espresso Martini' },
  }),

  draft({
    id: 'olives',
    category: 'food',
    name: { hr: 'Marinirane masline', en: 'Marinated olives' },
    description: { hr: 'Mali zalogaj za početak.', en: 'A small bite to start.' },
    tags: ['vegetarian'],
  }),
  draft({
    id: 'board',
    category: 'food',
    name: { hr: 'Daska sireva i pršuta', en: 'Cheese and ham board' },
    description: { hr: 'Za podijeliti.', en: 'For sharing.' },
  }),
  draft({ id: 'toast', category: 'food', name: { hr: 'Tost', en: 'Toasted sandwich' } }),
]
