export type MemberFieldName = 'fullName' | 'email' | 'password' | 'consent'

export type MemberFormError = 'invalid' | 'unconfirmed' | 'rateLimit' | 'server'

export type MemberAuthState =
  | { status: 'idle' }
  | {
      status: 'error'
      fieldErrors: Partial<Record<MemberFieldName, string>>
      formError?: MemberFormError
      values: { fullName?: string; email?: string }
    }
  | { status: 'check-email'; email: string }

export type LoyaltyMember = {
  member_number: string
  member_code: string
  full_name: string
  created_at: string
  status: 'active' | 'suspended'
}
