# Länstrafiken Örebro — ny buss-app

Fristående reseplanerar-app för kollektivtrafiken i Örebro län, byggd helt på
**öppna data från Trafiklab** (kräver inget avtal med Region Örebro län).
Detta är **Fas 1 (MVP)** enligt [den funktionella planen](docs/PLAN.md):
appen är demon och förhandlingskortet — biljetter (Fas 3) kräver BoB-avtal.

## Funktioner (Fas 1)

- 🗺 **Kartan som hemskärm** — närliggande hållplatser och alla bussar i länet
  live på kartan (GTFS-RT VehiclePositions, pollas var 5:e sekund)
- 🚌 **Avgångstavlor med realtid** — hållplatssök, förseningar i orange med
  struken tidtabellstid, inställda avgångar i rött, läge/plattform
- 🧭 **Resesök A→B** — hållplats, adress, POI eller "min position", med
  förseningar och inställda ben **inline i resultaten**
- ⚠️ **Störningar** — GTFS-RT ServiceAlerts med badge i tabbaren
- ★ **Favorithållplatser** — sparas lokalt (AsyncStorage)
- 🌐 **Svenska + engelska**

## Teknik

| Del | Val |
|---|---|
| App | React Native + Expo (SDK 53), TypeScript strict |
| Karta | MapLibre (`@maplibre/maplibre-react-native`) + OpenFreeMap-stil — ingen Google-låsning |
| Data-fetching | TanStack React Query (pollning, cache, graceful degradation) |
| State | Zustand + AsyncStorage (favoriter, språk) |
| Realtid | GTFS-RT (`gtfs-realtime-bindings`, protobuf) för operatören `orebro` |
| Resesök | ResRobot v2.1 (Trafiklab) |

### Struktur

```
src/
  api/         ResRobot- och GTFS-RT-klienter (rena funktioner, typade svar)
  components/  DepartureRow, TripCard, StopSearchField, LinePill, …
  hooks/       React Query-hooks + platshook
  i18n/        sv/en — typade så att ingen nyckel kan saknas
  navigation/  Bottom tabs + stack (avgångar → hållplatsdetalj)
  screens/     Karta, Avgångar, Sök resa, Störningar, Mer
  state/       Zustand-stores (favoriter, inställningar)
  config.ts    API-endpoints, nycklar, pollningsintervall
```

## Kom igång

1. **Skaffa API-nycklar** på [developer.trafiklab.se](https://developer.trafiklab.se)
   (gratis): *ResRobot v2.1*, *GTFS Regional Realtime* och *GTFS Regional Static*.
2. ```bash
   cp .env.example .env   # fyll i nycklarna
   npm install
   ```
3. **Kör** — MapLibre är en nativ modul, så Expo Go räcker inte för kartfliken.
   Bygg en dev-klient:
   ```bash
   npx expo run:android   # eller: npx expo run:ios
   ```
   (Övriga flikar fungerar även i Expo Go: `npm start`.)

## Datakällor & attribution

Data hämtas från [Trafiklab.se](https://www.trafiklab.se) (CC-BY) — attribution
visas i appen. GTFS-RT-flödena för `orebro`: VehiclePositions (~3 s),
TripUpdates & ServiceAlerts (15 s). Kartdata © OpenStreetMap-bidragsgivare via
OpenFreeMap.

## Roadmap (ur planen)

- **Fas 2** — bevakningar + push vid försening/inställd (kräver liten BFF-backend
  som matchar ServiceAlerts mot favoriter), widgets, Live Activities
- **Fas 3** — biljetter via BoB (Samtrafiken), *kräver avtal med Region Örebro län*:
  köp-nu-aktivera-senare, offline-rendering av signerad MTB→Aztec,
  enhetsbyte utan 24h-spärr, biljettdelning
- **Fas 4** — Swish, Apple/Google Pay, Klarna, BankID, studentverifiering
- **Fas 5** — tillgänglighetsrevision (WCAG 2.1 AA), pentest, GDPR-DPIA

Se [docs/PLAN.md](docs/PLAN.md) för hela den funktionella planen, inklusive
affärsläget (LOU, upphandling) och BoB-integrationsmodellerna.
