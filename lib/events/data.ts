import type { VenueEvent } from './types'

/**
 * Temporary sample programme. Titles are generic, performers, prices and ticket links are
 * intentionally empty until the venue confirms the real programme. Replaced by database rows in the admin phase.
 */

type Draft = Pick<VenueEvent, 'id' | 'type' | 'title' | 'description' | 'start'> & Partial<VenueEvent>

const draft = (event: Draft): VenueEvent => ({
  entry: 'tbc',
  price: null,
  ticketing: { mode: 'external', url: null },
  status: 'scheduled',
  placeholder: true,
  ...event,
})

export const venueEvents: VenueEvent[] = [
  draft({
    id: 'sandi-cenov-live',
    type: 'live-music',
    title: { hr: 'Sandi Cenov – Live', en: 'Sandi Cenov – Live' },
    description: {
      hr: 'Večer uz Sandija Cenova i njegove najveće hitove uživo.',
      en: 'An evening with Sandi Cenov and his biggest hits, live.',
    },
    performer: 'Sandi Cenov',
    start: '2026-12-01T21:00:00+01:00',
    end: '2026-12-02T00:00:00+01:00',
    image: '/images/events/sandi-cenov-live.png',
    placeholder: false,
  }),
  draft({
    id: 'stand-up-zlatan-zuhric-zuhra',
    type: 'special',
    title: { hr: 'Stand up – Zlatan Zuhrić Zuhra', en: 'Stand-up – Zlatan Zuhrić Zuhra' },
    description: {
      hr: 'Večer stand up komedije sa Zlatanom Zuhrićem Zuhrom.',
      en: 'An evening of stand-up comedy with Zlatan Zuhrić Zuhra.',
    },
    performer: 'Zlatan Zuhrić Zuhra',
    start: '2026-12-07T21:00:00+01:00',
    end: '2026-12-07T23:30:00+01:00',
    image: '/images/events/stand-up-zuhra.png',
    placeholder: false,
  }),
  draft({
    id: 'dj-dule-delante',
    type: 'dj',
    title: { hr: 'DJ Dule Delante', en: 'DJ Dule Delante' },
    description: {
      hr: 'Plesna večer uz DJ-a Dulu Delante.',
      en: 'A dance night with DJ Dule Delante.',
    },
    performer: 'DJ Dule Delante',
    start: '2026-12-08T22:00:00+01:00',
    end: '2026-12-09T02:00:00+01:00',
    image: '/images/events/dj-dule-delante.png',
    placeholder: false,
  }),
  draft({
    id: 'live-glazba',
    type: 'live-music',
    title: { hr: 'Večer uz live glazbu', en: 'Live music night' },
    description: {
      hr: 'Opuštena večer uz glazbu uživo. Izvođača i detalje programa objavit ćemo nakon potvrde.',
      en: 'A relaxed evening with live music. The performer and programme details will be announced once confirmed.',
    },
    start: '2026-11-06T21:00:00+01:00',
    end: '2026-11-07T00:00:00+01:00',
  }),
  draft({
    id: 'dj-vecer',
    type: 'dj',
    title: { hr: 'DJ večer', en: 'DJ night' },
    description: {
      hr: 'Večer uz dobru glazbu i društvo. Točan DJ i satnica bit će objavljeni nakon potvrde.',
      en: 'An evening of good music and good company. The DJ and exact schedule will be announced once confirmed.',
    },
    start: '2026-11-13T22:00:00+01:00',
    end: '2026-11-14T02:00:00+01:00',
  }),
  draft({
    id: 'kviz-vecer',
    type: 'quiz',
    title: { hr: 'Kviz večer', en: 'Quiz night' },
    description: {
      hr: 'Okupi ekipu i okušaj se u kvizu općeg znanja. Pravila i nagrade objavit ćemo nakon potvrde.',
      en: 'Gather your team and test your general knowledge. Rules and prizes will be announced once confirmed.',
    },
    start: '2026-11-20T20:00:00+01:00',
    end: '2026-11-20T23:00:00+01:00',
  }),
  draft({
    id: 'degustacija-whiskyja',
    type: 'tasting',
    title: { hr: 'Degustacija whiskyja', en: 'Whisky tasting' },
    description: {
      hr: 'Vođena degustacija za ljubitelje whiskyja. Izbor etiketa i cijena bit će objavljeni nakon potvrde.',
      en: 'A guided tasting for whisky lovers. The selection and price will be announced once confirmed.',
    },
    start: '2026-12-04T19:00:00+01:00',
    end: '2026-12-04T22:00:00+01:00',
  }),
  draft({
    id: 'live-glazba-rujan',
    type: 'live-music',
    title: { hr: 'Live glazba — rujanska večer', en: 'Live music — September night' },
    description: {
      hr: 'Primjer već održanog događanja za prikaz arhive programa.',
      en: 'A sample past event used to show the programme archive.',
    },
    start: '2026-09-26T21:00:00+02:00',
    end: '2026-09-27T00:00:00+02:00',
  }),
]
