/**
 * React Query-hooks för all datahämtning. Realtidsdata pollas med intervall
 * från config; vid nätverksfel behålls senast kända data (graceful degradation).
 */
import { useQuery } from '@tanstack/react-query';

import { fetchServiceAlerts, fetchVehiclePositions } from '@/api/gtfsrt';
import {
  departureBoard,
  nearbyStops,
  searchLocations,
  searchTrips,
  type StopLocation,
  type TripQuery,
} from '@/api/resrobot';
import { config } from '@/config';
import { useSettings } from '@/state/settings';

export function useLocationSearch(query: string) {
  return useQuery({
    queryKey: ['locations', query],
    queryFn: () => searchLocations(query),
    enabled: query.trim().length >= 2,
    staleTime: 60_000,
  });
}

export function useNearbyStops(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['nearbyStops', lat?.toFixed(4), lon?.toFixed(4)],
    queryFn: () => nearbyStops(lat!, lon!),
    enabled: lat !== undefined && lon !== undefined,
    staleTime: 5 * 60_000,
  });
}

export function useDepartures(stopId?: string) {
  return useQuery({
    queryKey: ['departures', stopId],
    queryFn: () => departureBoard(stopId!),
    enabled: !!stopId,
    refetchInterval: config.poll.departures,
  });
}

export function useTrips(query: TripQuery | null) {
  return useQuery({
    queryKey: [
      'trips',
      query?.origin.extId,
      query?.dest.extId,
      query?.dateTime?.toISOString(),
      query?.searchForArrival,
    ],
    queryFn: () => searchTrips(query!),
    enabled: !!query,
  });
}

export function useVehiclePositions(enabled: boolean) {
  return useQuery({
    queryKey: ['vehiclePositions'],
    queryFn: fetchVehiclePositions,
    enabled: enabled && config.gtfsRtKey.length > 0,
    refetchInterval: config.poll.vehiclePositions,
  });
}

export function useServiceAlerts() {
  const language = useSettings((s) => s.language);
  return useQuery({
    queryKey: ['serviceAlerts', language],
    queryFn: () => fetchServiceAlerts(language),
    enabled: config.gtfsRtKey.length > 0,
    refetchInterval: config.poll.serviceAlerts,
  });
}

export type { StopLocation, TripQuery };
