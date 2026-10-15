import {
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  House,
  Images,
  MapPin,
  Martini,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { PageKey } from '@/lib/i18n/config'
import type { NavItem } from '@/lib/navigation'

const icons: Record<PageKey, LucideIcon> = {
  home: House,
  menu: Martini,
  events: CalendarDays,
  reservations: CalendarCheck,
  gallery: Images,
  careers: Users,
  contact: MapPin,
}

export const navIconFor = (item: Pick<NavItem, 'key'>): LucideIcon =>
  item.key === 'external' ? ArrowUpRight : icons[item.key]
