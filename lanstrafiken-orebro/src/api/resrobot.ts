/**
 * Klient mot ResRobot v2.1 (Trafiklab) — hållplatssök, avgångstavlor och
 * resesök A→B. Öppna data, CC-BY: "Data från Trafiklab.se" visas i appen.
 * Dokumentation: https://www.trafiklab.se/api/our-apis/resrobot-v21/
 */
import { config } from '@/config';

export interface StopLocation {
  id: string;
  extId: string;
  name: string;
  lat: number;
  lon: number;
  /** Sant för hållplatser, falskt för adresser/POI. */
  isStop: boolean;
}

export interface Departure {
  /** Linjebeteckning som visas på bussen, t.ex. "1" eller "702". */
  line: string;
  direction: string;
  /** Tidtabellstid, lokal tid. */
  scheduled: Date;
  /** Realtidsprognos om sådan finns. */
  realtime?: Date;
  cancelled: boolean;
  /** Läge/plattform om känt. */
  track?: string;
  operator?: string;
  /** Produktkategori, t.ex. "BLT" (buss). */
  category?: string;
}

export interface TripLeg {
  kind: 'walk' | 'transit';
  originName: string;
  destName: string;
  departure: Date;
  arrival: Date;
  realtimeDeparture?: Date;
  realtimeArrival?: Date;
  cancelled: boolean;
  /** Endast transit-ben: */
  line?: string;
  direction?: string;
  originTrack?: string;
  destTrack?: string;
  /** Endast gång-ben: meter. */
  distanceMeters?: number;
}

export interface Trip {
  legs: TripLeg[];
  departure: Date;
  arrival: Date;
  durationMinutes: number;
  transferCount: number;
}

class ResRobotError extends Error {}

async function get<T>(path: string, params: Record<string, string | number>): Promise<T> {
  const search = new URLSearchParams({
    format: 'json',
    accessId: config.resrobotKey,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });
  const res = await fetch(`${config.resrobotBaseUrl}${path}?${search}`);
  if (!res.ok) {
    throw new ResRobotError(`ResRobot ${path} svarade ${res.status}`);
  }
  return (await res.json()) as T;
}

/** ResRobot skickar tid som "HH:MM:SS" + datum "YYYY-MM-DD" i lokal svensk tid. */
function parseDateTime(date: string, time: string): Date {
  return new Date(`${date}T${time}`);
}

// --- Hållplats-/platssök -------------------------------------------------

export async function searchLocations(query: string): Promise<StopLocation[]> {
  if (query.trim().length < 2) return [];
  const data = await get<{ stopLocationOrCoordLocation?: unknown[] }>('/location.name', {
    input: `${query.trim()}?`,
    maxNo: 10,
  });
  return (data.stopLocationOrCoordLocation ?? [])
    .map((entry) => {
      const raw = entry as Record<string, any>;
      const stop = raw.StopLocation;
      const coord = raw.CoordLocation;
      if (stop) {
        return {
          id: stop.id as string,
          extId: stop.extId as string,
          name: stop.name as string,
          lat: stop.lat as number,
          lon: stop.lon as number,
          isStop: true,
        };
      }
      if (coord) {
        return {
          id: coord.id as string,
          extId: coord.id as string,
          name: coord.name as string,
          lat: coord.lat as number,
          lon: coord.lon as number,
          isStop: false,
        };
      }
      return null;
    })
    .filter((s): s is StopLocation => s !== null);
}

export async function nearbyStops(lat: number, lon: number): Promise<StopLocation[]> {
  const data = await get<{ stopLocationOrCoordLocation?: unknown[] }>('/location.nearbystops', {
    originCoordLat: lat,
    originCoordLong: lon,
    maxNo: 15,
    r: 1500,
  });
  return (data.stopLocationOrCoordLocation ?? [])
    .map((entry) => (entry as Record<string, any>).StopLocation)
    .filter(Boolean)
    .map((stop: Record<string, any>) => ({
      id: stop.id as string,
      extId: stop.extId as string,
      name: stop.name as string,
      lat: stop.lat as number,
      lon: stop.lon as number,
      isStop: true,
    }));
}

// --- Avgångstavla ---------------------------------------------------------

export async function departureBoard(stopId: string): Promise<Departure[]> {
  const data = await get<{ Departure?: Record<string, any>[] }>('/departureBoard', {
    id: stopId,
    duration: 60,
    maxJourneys: 30,
  });
  return (data.Departure ?? []).map((d) => {
    const product = Array.isArray(d.ProductAtStop) ? d.ProductAtStop[0] : d.ProductAtStop;
    return {
      line: (product?.displayNumber ?? product?.num ?? d.transportNumber ?? '?') as string,
      direction: (d.direction ?? '') as string,
      scheduled: parseDateTime(d.date, d.time),
      realtime: d.rtTime ? parseDateTime(d.rtDate ?? d.date, d.rtTime) : undefined,
      cancelled: d.cancelled === true,
      track: (d.rtTrack ?? d.track) as string | undefined,
      operator: product?.operator as string | undefined,
      category: product?.catOut as string | undefined,
    };
  });
}

// --- Resesök A→B ----------------------------------------------------------

export interface TripQuery {
  origin: StopLocation;
  dest: StopLocation;
  /** Sökning bakåt/framåt i tiden från detta klockslag; utelämnas = nu. */
  dateTime?: Date;
  searchForArrival?: boolean;
}

function locationParams(prefix: 'origin' | 'dest', loc: StopLocation): Record<string, string | number> {
  // Hållplatser refereras med id; adresser/POI med koordinater.
  if (loc.isStop) return { [`${prefix}Id`]: loc.extId };
  return {
    [`${prefix}CoordLat`]: loc.lat,
    [`${prefix}CoordLong`]: loc.lon,
  };
}

export async function searchTrips(query: TripQuery): Promise<Trip[]> {
  const params: Record<string, string | number> = {
    ...locationParams('origin', query.origin),
    ...locationParams('dest', query.dest),
    passlist: 0,
    numF: 6,
  };
  if (query.dateTime) {
    const d = query.dateTime;
    params.date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate(),
    ).padStart(2, '0')}`;
    params.time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  if (query.searchForArrival) params.searchForArrival = 1;

  const data = await get<{ Trip?: Record<string, any>[] }>('/trip', params);
  return (data.Trip ?? []).map(parseTrip);
}

function parseTrip(raw: Record<string, any>): Trip {
  const rawLegs: Record<string, any>[] = raw.LegList?.Leg ?? [];
  const legs: TripLeg[] = rawLegs.map((leg) => {
    const isWalk = leg.type === 'WALK' || leg.type === 'TRSF';
    const product = Array.isArray(leg.Product) ? leg.Product[0] : leg.Product;
    return {
      kind: isWalk ? 'walk' : 'transit',
      originName: leg.Origin?.name ?? '',
      destName: leg.Destination?.name ?? '',
      departure: parseDateTime(leg.Origin.date, leg.Origin.time),
      arrival: parseDateTime(leg.Destination.date, leg.Destination.time),
      realtimeDeparture: leg.Origin?.rtTime
        ? parseDateTime(leg.Origin.rtDate ?? leg.Origin.date, leg.Origin.rtTime)
        : undefined,
      realtimeArrival: leg.Destination?.rtTime
        ? parseDateTime(leg.Destination.rtDate ?? leg.Destination.date, leg.Destination.rtTime)
        : undefined,
      cancelled: leg.cancelled === true,
      line: isWalk ? undefined : ((product?.displayNumber ?? product?.num) as string | undefined),
      direction: isWalk ? undefined : (leg.direction as string | undefined),
      originTrack: (leg.Origin?.rtTrack ?? leg.Origin?.track) as string | undefined,
      destTrack: (leg.Destination?.rtTrack ?? leg.Destination?.track) as string | undefined,
      distanceMeters: isWalk ? (leg.dist as number | undefined) : undefined,
    };
  });

  const departure = legs[0]?.realtimeDeparture ?? legs[0]?.departure ?? new Date();
  const last = legs[legs.length - 1];
  const arrival = last?.realtimeArrival ?? last?.arrival ?? departure;
  return {
    legs,
    departure,
    arrival,
    durationMinutes: Math.max(0, Math.round((arrival.getTime() - departure.getTime()) / 60_000)),
    transferCount: Math.max(0, legs.filter((l) => l.kind === 'transit').length - 1),
  };
}
