/**
 * GROQ expression for an image's CDN url. When the editor set a focal point (hotspot) in Studio it is
 * appended as `#fp=x,y`; the fragment never reaches the CDN and `CmsImage` turns it into `object-position`.
 */
export const imageUrl = (path: string) =>
  `select(defined(${path}.hotspot) => ${path}.asset->url + "#fp=" + string(${path}.hotspot.x) + "," + string(${path}.hotspot.y), ${path}.asset->url)`

/** Adds CDN sizing to a url from `imageUrl` while keeping the focal point fragment at the end. */
export function sizedImage(url: string, width: number) {
  const [base, fragment] = url.split('#')
  return `${base}?w=${width}&auto=format${fragment ? `#${fragment}` : ''}`
}
