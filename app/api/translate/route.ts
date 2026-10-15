import { generateText, Output } from 'ai'
import { z } from 'zod'

export const maxDuration = 60

const model = 'google/gemini-3-flash'
const apiVersion = '2025-01-01'
const tokenTtlMs = 5 * 60 * 1000

const bodySchema = z.object({
  items: z
    .array(z.object({ key: z.string().max(120), text: z.string().max(4000) }))
    .min(1)
    .max(40),
  context: z
    .object({
      documentType: z.string().max(80).optional(),
      field: z.string().max(200).optional(),
      siblings: z.array(z.object({ label: z.string().max(120), text: z.string().max(300) })).max(16).optional(),
    })
    .optional(),
})

const verifiedTokens = new Map<string, number>()

/** Only signed-in Studio users may spend translation credits: the Sanity token must be valid for this project. */
async function isStudioUser(token: string) {
  const cached = verifiedTokens.get(token)
  if (cached && cached > Date.now()) return true

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  if (!projectId) return false

  try {
    const response = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!response.ok) return false
    verifiedTokens.set(token, Date.now() + tokenTtlMs)
    return true
  } catch {
    return false
  }
}

const system = `You are the website translator for Parlament, a bar and café venue with a Croatian-speaking audience.
Translate Croatian into natural, idiomatic British English that fits the role of each field (heading, short label, menu item, event title, description, button).

Rules:
- Translate meaning and tone, not word for word. Use the vocabulary a real English-language bar or restaurant menu would use (for example "Kava" is "Coffee", "Pivo" is "Beer", "Žestoka pića" is "Spirits", "Večernja sjednica" is a themed evening, not a literal parliamentary session).
- Keep brand names, venue names, performer and person names, cocktail and product names, hashtags, URLs, numbers, currency and units unchanged.
- Keep the same length class, punctuation, capitalisation style and line breaks as the source. A heading stays a heading, a short label stays short.
- Use the document context only to choose the right meaning. Never translate or output the context.
- If a text is already English or has nothing to translate, return it unchanged.
- Return one translation for every key, with the key unchanged.`

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token || !(await isStudioUser(token))) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return Response.json({ error: 'invalid-request' }, { status: 400 })

  const { items, context } = parsed.data
  const contextLines = [
    context?.documentType ? `Document type: ${context.documentType}` : null,
    context?.field ? `Field: ${context.field}` : null,
    context?.siblings?.length
      ? `Other Croatian fields in the same document:\n${context.siblings.map((s) => `- ${s.label}: ${s.text}`).join('\n')}`
      : null,
  ].filter(Boolean)

  try {
    const { output } = await generateText({
      model,
      system,
      output: Output.object({
        schema: z.object({ translations: z.array(z.object({ key: z.string(), text: z.string() })) }),
      }),
      prompt: `${contextLines.join('\n')}\n\nTranslate these Croatian texts to English:\n${JSON.stringify(items)}`,
    })
    return Response.json({ translations: output.translations })
  } catch {
    return Response.json({ error: 'translation-failed' }, { status: 502 })
  }
}
