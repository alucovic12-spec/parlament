import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { pageDefaults, pageRoutes } from './sanity/defaults'
import { importPlugin } from './sanity/import-tool'
import { schemaTypes, singletonTypes } from './sanity/schema-types'
import { structure } from './sanity/structure'
import { translateAllAction, translateMissingAction } from './sanity/translate/translate-actions'

export const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  title: 'Parlament Admin',
  basePath: '/admin',
  plugins: [structureTool({ structure }), importPlugin()],
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
    actions: (prev, { schemaType }) => {
      const base = singletonTypes.has(schemaType) ? prev.filter(({ action }) => action !== 'duplicate') : prev
      return [translateMissingAction, translateAllAction, ...base]
    },
  },
})

export default config
