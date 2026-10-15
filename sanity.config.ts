import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { pageDefaults, pageRoutes } from './sanity/defaults'
import { schemaTypes, singletonTypes } from './sanity/schema-types'
import { structure } from './sanity/structure'

export const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  title: 'Parlament Admin',
  basePath: '/admin',
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
    templates: (templates) => [
      ...templates.filter(({ schemaType }) => schemaType !== 'pageContent'),
      ...pageRoutes.map(({ route, title }) => ({
        id: `page-${route}`,
        title,
        schemaType: 'pageContent',
        value: pageDefaults(route),
      })),
    ],
  },
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global' ? prev.filter(({ templateId }) => !singletonTypes.has(templateId) && !templateId.startsWith('page-')) : prev,
    actions: (prev, { schemaType }) =>
      singletonTypes.has(schemaType)
        ? prev.filter(({ action }) => action !== 'delete' && action !== 'duplicate' && action !== 'unpublish')
        : prev,
  },
})

export default config
