import { event } from './event'
import { galleryItem } from './gallery-item'
import { homePage } from './home-page'
import { localizedString, localizedText } from './localized'
import { menuCategory } from './menu-category'
import { menuItem } from './menu-item'
import { pageContent } from './page-content'
import { siteHeader } from './site-header'
import { siteSettings } from './site-settings'

export const schemaTypes = [
  localizedString,
  localizedText,
  event,
  menuCategory,
  menuItem,
  galleryItem,
  siteSettings,
  siteHeader,
  homePage,
  pageContent,
]

/** Documents that exist exactly once and cannot be created, duplicated or deleted. */
export const singletonTypes = new Set(['siteSettings', 'siteHeader', 'homePage', 'pageContent'])
