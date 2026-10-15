import { defineField, defineType } from 'sanity'
import { TranslateInput } from '../translate/translate-input'

const languageFields = (type: 'string' | 'text') => [
  defineField({
    name: 'hr',
    title: 'Hrvatski',
    type,
  }),
  defineField({
    name: 'en',
    title: 'English (prevodi se automatski iz hrvatskog)',
    type,
  }),
  defineField({
    name: 'enAuto',
    title: 'Engleski preveden automatski',
    type: 'boolean',
    hidden: true,
  }),
]

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Tekst (HR / EN)',
  type: 'object',
  fields: languageFields('string'),
  components: { input: TranslateInput },
})

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Dugi tekst (HR / EN)',
  type: 'object',
  fields: languageFields('text'),
  components: { input: TranslateInput },
})
