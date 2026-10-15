import { defineField, defineType } from 'sanity'

const languageFields = (type: 'string' | 'text') => [
  defineField({
    name: 'hr',
    title: 'Hrvatski',
    type,
  }),
  defineField({
    name: 'en',
    title: 'English',
    type,
  }),
]

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Tekst (HR / EN)',
  type: 'object',
  fields: languageFields('string'),
})

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Dugi tekst (HR / EN)',
  type: 'object',
  fields: languageFields('text'),
})
