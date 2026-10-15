import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { pageDefaults, pageRoutes } from './sanity/defaults'
import { importPlugin } from './sanity/import-tool'
import { managerPlugin } from './sanity/manager'
import { schemaTypes, singletonTypes } from './sanity/schema-types'
import { structure } from './sanity/structure'
import { translateAllAction, translateMissingAction } from './sanity/translate/translate-actions'

export const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  title: 'Parlament Admin',
  basePath: '/admin',
  plugins: [managerPlugin(), structureTool({ structure }), importPlugin()],
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
      // The first action becomes the big primary button, so Publish has to lead or it ends up hidden in the "..." menu.
      const publish = base.filter(({ action }) => action === 'publish')
      const others = base.filter(({ action }) => action !== 'publish')
      return [...publish, translateMissingAction, translateAllAction, ...others]
    },
  },
})

export default config
