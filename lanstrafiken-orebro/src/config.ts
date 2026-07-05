/**
 * Central konfiguration. API-nycklar läses från .env (EXPO_PUBLIC_*).
 * Skapa nycklar på https://developer.trafiklab.se — se .env.example.
 */
export const config = {
  resrobotKey: process.env.EXPO_PUBLIC_RESROBOT_KEY ?? '',
  gtfsRtKey: process.env.EXPO_PUBLIC_GTFS_RT_KEY ?? '',
  gtfsStaticKey: process.env.EXPO_PUBLIC_GTFS_STATIC_KEY ?? '',

  resrobotBaseUrl: 'https://api.resrobot.se/v2.1',
  gtfsRtBaseUrl: 'https://opendata.samtrafiken.se/gtfs-rt/orebro',
  gtfsStaticUrl: 'https://opendata.samtrafiken.se/gtfs/orebro/orebro.zip',

  /** Örebro resecentrum — startvy för kartan innan positionen är känd. */
  defaultRegion: {
    latitude: 59.2787,
    longitude: 15.2134,
    zoom: 13,
  },

  /** Pollningsintervall (ms). GTFS-RT för orebro uppdateras var ~3 s (fordon) / 15 s (övrigt). */
  poll: {
    vehiclePositions: 5_000,
    serviceAlerts: 60_000,
    departures: 30_000,
  },

  /** Fri kartstil utan API-nyckel (OpenFreeMap, OSM-data). */
  mapStyleUrl: 'https://tiles.openfreemap.org/styles/liberty',
} as const;

export function isConfigured(): boolean {
  return config.resrobotKey.length > 0;
}
