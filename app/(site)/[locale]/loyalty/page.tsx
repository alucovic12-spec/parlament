import type { Metadata } from 'next'
import { AuthPanel } from '@/components/loyalty/auth-panel'
import { MemberCard } from '@/components/loyalty/member-card'
import { Button } from '@/components/ui/button'
import type { Locale } from '@/lib/i18n/config'
import { getMessages } from '@/lib/i18n/messages'
import { signOutMember } from '@/lib/loyalty/actions'
import type { LoyaltyMember } from '@/lib/loyalty/types'
import { JsonLd } from '@/components/shared/json-ld'
import { breadcrumbJsonLd, buildMetadata } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ auth?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata(locale as Locale, 'loyalty')
}

async function getMember() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { user: null, member: null }

  const { data } = await supabase
    .from('loyalty_members')
    .select('member_number, member_code, full_name, created_at, status')
    .eq('id', user.id)
    .maybeSingle<LoyaltyMember>()

  return { user, member: data }
}

function SignOutForm({ locale, label }: { locale: Locale; label: string }) {
  return (
    <form action={signOutMember}>
      <input type="hidden" name="locale" value={locale} />
      <Button type="submit" variant="outline">
        {label}
      </Button>
    </form>
  )
}

export default async function LoyaltyPage({ params, searchParams }: Props) {
  const locale = (await params).locale as Locale
  const { auth } = await searchParams
  const m = getMessages(locale)
  const t = m.member
  const { user, member } = await getMember()

  if (user) {
    return (
      <main className="interior-page mx-auto max-w-none px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8">
        <p className="text-xs uppercase tracking-[0.28em] text-primary">{t.eyebrow}</p>
        <h1 className="mt-3 text-balance font-display text-3xl leading-tight sm:text-5xl">
          {member ? `${t.card.welcome}, ${member.full_name.split(' ')[0]}` : m.pages.loyalty.title}
        </h1>

        <div className="mt-10 space-y-8">
          {member ? (
            <>
              <MemberCard locale={locale} member={member} labels={t.card} />
              <p className="mx-auto max-w-md text-center text-sm text-muted-foreground">
                {member.status === 'suspended' ? t.card.suspended : t.card.qrHelp}
              </p>
              <p className="mx-auto max-w-md text-center text-sm text-primary">{t.notice}</p>
            </>
          ) : (
            <p className="text-muted-foreground">{t.missing}</p>
          )}
          <div className="flex justify-center">
            <SignOutForm locale={locale} label={t.signOut} />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="interior-page">
      <JsonLd data={breadcrumbJsonLd(locale, 'loyalty')} />
      <header className="interior-hero">
        <div className="interior-hero-inner">
          <p className="interior-eyebrow">{t.eyebrow}</p>
          <h1 className="interior-title">{m.pages.loyalty.title}</h1>
          <p className="interior-intro">{t.intro}</p>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-4 pb-24 sm:px-6 lg:grid-cols-[1fr_26rem] lg:px-8">
        <section aria-labelledby="member-benefits" className="interior-panel h-fit p-7">
          <h2 id="member-benefits" className="font-display text-2xl">
            {t.benefitsTitle}
          </h2>
          <ul className="mt-4 space-y-3">
            {t.benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3 text-muted-foreground">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-medium text-primary">{t.notice}</p>
        </section>

        <AuthPanel
          locale={locale}
          labels={t}
          initialNotice={auth === 'failed' ? t.errors.callback : undefined}
        />
      </div>
    </main>
  )
}
