const apiVersion = '2025-01-01'
const revalidateSeconds = 60

/** Runs a GROQ query against the published dataset, or returns `null` when Sanity is not configured or unreachable. */
export async function sanityFetch<T>(query: string, tags: string[]): Promise<T | null> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
  if (!projectId) return null

  const url = new URL(`https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`)
  url.searchParams.set('query', query)
  url.searchParams.set('perspective', 'published')

  try {
    const response = await fetch(url, { next: { revalidate: revalidateSeconds, tags } })
    if (!response.ok) return null
    const { result } = (await response.json()) as { result: T }
    return result
  } catch {
    return null
  }
}
