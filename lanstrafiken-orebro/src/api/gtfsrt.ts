/**
 * Klient mot Trafiklabs GTFS Regional Realtime för operatören "orebro":
 * VehiclePositions (~3 s), ServiceAlerts och TripUpdates (15 s).
 * Protobuf-avkodning via gtfs-realtime-bindings.
 * Dokumentation: https://www.trafiklab.se/api/our-apis/gtfs-regional/
 */
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

import { config } from '@/config';

const { FeedMessage } = GtfsRealtimeBindings.transit_realtime;

export interface VehiclePosition {
  id: string;
  lat: number;
  lon: number;
  /** Kurs i grader, 0 = norr. */
  bearing?: number;
  /** route_id ur statiska GTFS-feeden (kan slås upp mot linjenummer). */
  routeId?: string;
  tripId?: string;
  timestamp?: number;
}

export interface ServiceAlert {
  id: string;
  header: string;
  description: string;
  /** Unix-sekunder. */
  activeFrom?: number;
  activeTo?: number;
  /** Berörda route_ids/stop_ids om utpekade. */
  routeIds: string[];
  stopIds: string[];
  severity?: string;
}

async function fetchFeed(name: 'VehiclePositions' | 'ServiceAlerts' | 'TripUpdates') {
  const url = `${config.gtfsRtBaseUrl}/${name}.pb?key=${config.gtfsRtKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GTFS-RT ${name} svarade ${res.status}`);
  }
  const buffer = await res.arrayBuffer();
  return FeedMessage.decode(new Uint8Array(buffer));
}

export async function fetchVehiclePositions(): Promise<VehiclePosition[]> {
  const feed = await fetchFeed('VehiclePositions');
  const vehicles: VehiclePosition[] = [];
  for (const entity of feed.entity) {
    const v = entity.vehicle;
    if (!v?.position) continue;
    vehicles.push({
      id: v.vehicle?.id ?? entity.id,
      lat: v.position.latitude,
      lon: v.position.longitude,
      bearing: v.position.bearing ?? undefined,
      routeId: v.trip?.routeId ?? undefined,
      tripId: v.trip?.tripId ?? undefined,
      timestamp: typeof v.timestamp === 'number' ? v.timestamp : v.timestamp?.toNumber(),
    });
  }
  return vehicles;
}

/** Plockar svensk text i första hand, annars första tillgängliga översättning. */
function pickTranslation(
  text: { translation?: ({ text?: string | null; language?: string | null } | null)[] | null } | null | undefined,
  language: string,
): string {
  const translations = text?.translation ?? [];
  const match = translations.find((t) => t?.language === language);
  return (match?.text ?? translations[0]?.text ?? '').trim();
}

export async function fetchServiceAlerts(language: string = 'sv'): Promise<ServiceAlert[]> {
  const feed = await fetchFeed('ServiceAlerts');
  const alerts: ServiceAlert[] = [];
  for (const entity of feed.entity) {
    const a = entity.alert;
    if (!a) continue;
    const period = a.activePeriod?.[0];
    const toNum = (v: unknown): number | undefined =>
      typeof v === 'number' ? v : v ? (v as { toNumber(): number }).toNumber() : undefined;
    alerts.push({
      id: entity.id,
      header: pickTranslation(a.headerText, language),
      description: pickTranslation(a.descriptionText, language),
      activeFrom: toNum(period?.start),
      activeTo: toNum(period?.end),
      routeIds: (a.informedEntity ?? [])
        .map((e) => e.routeId)
        .filter((r): r is string => !!r),
      stopIds: (a.informedEntity ?? [])
        .map((e) => e.stopId)
        .filter((s): s is string => !!s),
    });
  }
  // Visa bara aktiva/kommande störningar, nyast först.
  const now = Date.now() / 1000;
  return alerts
    .filter((a) => a.activeTo === undefined || a.activeTo > now)
    .sort((a, b) => (b.activeFrom ?? 0) - (a.activeFrom ?? 0));
}
