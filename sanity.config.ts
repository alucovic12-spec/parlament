import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './sanity/schema-types'
import { structure } from './sanity/structure'

export const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  title: 'Parlament Admin',
  basePath: '/admin',
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
  },
})

export default config
