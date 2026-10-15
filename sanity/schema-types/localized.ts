import { defineField, defineType } from 'sanity'

const languageFields = (type: 'string' | 'text', required: boolean) => [
  defineField({
    name: 'hr',
    title: 'Hrvatski',
    type,
    validation: required ? (rule) => rule.required() : undefined,
  }),
  defineField({
    name: 'en',
    title: 'English',
    type,
    validation: required ? (rule) => rule.required() : undefined,
  }),
]

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Tekst (HR / EN)',
  type: 'object',
  fields: languageFields('string', true),
})

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Dugi tekst (HR / EN)',
  type: 'object',
  fields: languageFields('text', false),
})
