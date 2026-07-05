export type Language = 'sv' | 'en';

const sv = {
  tabs: {
    map: 'Karta',
    departures: 'Avgångar',
    trip: 'Sök resa',
    disruptions: 'Störningar',
    more: 'Mer',
  },
  common: {
    loading: 'Hämtar…',
    retry: 'Försök igen',
    error: 'Något gick fel. Kontrollera nätverket och försök igen.',
    noApiKey:
      'API-nyckel saknas. Kopiera .env.example till .env och fyll i dina Trafiklab-nycklar.',
    now: 'Nu',
    minShort: 'min',
    cancelled: 'Inställd',
    delayed: 'Försenad',
    onTime: 'I tid',
    realtime: 'realtid',
    track: 'Läge',
    myPosition: 'Min position',
    searchStop: 'Sök hållplats…',
    favorites: 'Favoriter',
    noFavorites: 'Inga favoriter ännu. Stjärnmärk en hållplats så hamnar den här.',
    attribution: 'Data från Trafiklab.se (CC-BY)',
  },
  map: {
    title: 'Karta',
    nearbyStops: 'Närliggande hållplatser',
    liveBuses: 'Bussar i realtid',
    locationDenied: 'Platsåtkomst nekad — visar Örebro resecentrum.',
  },
  departures: {
    title: 'Avgångar',
    empty: 'Inga avgångar den närmaste timmen.',
    towards: 'mot',
  },
  trip: {
    title: 'Sök resa',
    from: 'Från',
    to: 'Till',
    swap: 'Byt riktning',
    search: 'Sök resa',
    earlier: 'Tidigare',
    later: 'Senare',
    empty: 'Inga resförslag hittades.',
    walk: 'Gå',
    changes: 'byten',
    change: 'byte',
    departNow: 'Avgår nu',
  },
  disruptions: {
    title: 'Störningar',
    empty: 'Inga kända störningar i Örebro län just nu. 🎉',
    activeSince: 'Gäller från',
    until: 'till',
  },
  more: {
    title: 'Mer',
    language: 'Språk / Language',
    tickets: 'Biljetter',
    ticketsInfo:
      'Biljettköp kommer i en senare version — det kräver avtal med Region Örebro län och integration mot BoB-standarden (Samtrafiken). Fram till dess hänvisas till Länstrafikens befintliga app.',
    about: 'Om appen',
    aboutText:
      'Fristående reseplanerare för Länstrafiken Örebro byggd på öppna data. Realtidsdata hämtas från Trafiklabs GTFS-RT-flöden (operatör "orebro") och resesökning via ResRobot v2.1.',
    version: 'Version',
  },
};

/** Nyckelstrukturen speglar sv — TypeScript garanterar att inget saknas. */
const en: typeof sv = {
  tabs: {
    map: 'Map',
    departures: 'Departures',
    trip: 'Plan trip',
    disruptions: 'Disruptions',
    more: 'More',
  },
  common: {
    loading: 'Loading…',
    retry: 'Try again',
    error: 'Something went wrong. Check your connection and try again.',
    noApiKey:
      'API key missing. Copy .env.example to .env and add your Trafiklab keys.',
    now: 'Now',
    minShort: 'min',
    cancelled: 'Cancelled',
    delayed: 'Delayed',
    onTime: 'On time',
    realtime: 'real-time',
    track: 'Stop point',
    myPosition: 'My position',
    searchStop: 'Search stop…',
    favorites: 'Favourites',
    noFavorites: 'No favourites yet. Star a stop and it will show up here.',
    attribution: 'Data from Trafiklab.se (CC-BY)',
  },
  map: {
    title: 'Map',
    nearbyStops: 'Nearby stops',
    liveBuses: 'Live buses',
    locationDenied: 'Location denied — showing Örebro resecentrum.',
  },
  departures: {
    title: 'Departures',
    empty: 'No departures within the next hour.',
    towards: 'towards',
  },
  trip: {
    title: 'Plan trip',
    from: 'From',
    to: 'To',
    swap: 'Swap direction',
    search: 'Find trips',
    earlier: 'Earlier',
    later: 'Later',
    empty: 'No trips found.',
    walk: 'Walk',
    changes: 'changes',
    change: 'change',
    departNow: 'Departs now',
  },
  disruptions: {
    title: 'Disruptions',
    empty: 'No known disruptions in Örebro county right now. 🎉',
    activeSince: 'Active from',
    until: 'until',
  },
  more: {
    title: 'More',
    language: 'Språk / Language',
    tickets: 'Tickets',
    ticketsInfo:
      'Ticket purchasing will arrive in a later version — it requires an agreement with Region Örebro län and integration with the BoB standard (Samtrafiken). Until then, please use the existing Länstrafiken app.',
    about: 'About',
    aboutText:
      'Independent journey planner for Länstrafiken Örebro built on open data. Real-time data comes from Trafiklab GTFS-RT feeds (operator "orebro") and trip search via ResRobot v2.1.',
    version: 'Version',
  },
};

export const translations: Record<Language, typeof sv> = { sv, en };
export type Translations = typeof sv;
