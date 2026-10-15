/** GROQ fragment that resolves a link to a Studio-made page into its slug and title. Add inside any `{...}` projection that reads link fields. */
export const linkProjection = `"customPage": customPage->slug.current, "customPageTitle": customPage->title{hr, en}`
