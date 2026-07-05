# Ny app för Länstrafiken Örebro — Funktionell plan

*Version 0.1 — 2026-07-04. Fokus: funktionalitet och teknik. Design tas separat.*

---

## 1. Nulägesanalys — den befintliga appen

**Leverantör:** Infospread Euro AB (MobiTime-plattformen). Samma vitmärkta app som används av flera andra länstrafikbolag.

**Funktioner idag:** mobilbiljett (enkel, 24h, period, Flex 10/40), reseplanerare med realtid, hållplatstider med realtid, nedladdningsbara tidtabeller (ser ut som papperstidtabeller), trafikavvikelser. Betalning: Swish, bankkort, månadsfaktura. Klarna-prenumeration (12 mån, betala för 10).

**Dokumenterade svagheter:**
- **24h-spärr vid enhetsbyte** — loggar du in på ny mobil dröjer det ett dygn innan biljetten är tillgänglig. Stor friktion.
- **Två separata köpflöden** — "Sök och köp resa" (regionbuss) vs "Köp biljett" (stadstrafik). Förvirrande, olika regler.
- **Biljett aktiveras direkt vid köp** — kan bara köpas max 20 min före avgång. Ingen "köp nu, aktivera senare".
- **Ingen biljettdelning** — uttryckligen efterfrågat i App Store-recensioner (Östgötatrafiken har det).
- **Single point of failure** — CrowdStrike-incidenten juli 2024 slog ut hela biljettköpet via leverantören Forsler Stjerna; resenärer tvingades betala dyrare ombordpris.
- **Historiskt teknikstrul** — reskassa och app har beräknat olika pris för samma resa.
- **Föråldrad UX** — tidtabeller som PDF-liknande vyer, ingen kartcentrerad upplevelse à la SL.

## 2. Målbild — inspirerad av SL-appen

Kärnprinciper från SL som ska in:
1. **Kartan som hemskärm** — närliggande hållplatser, avgångar direkt, bussar i realtid på kartan (GPS-data finns för Örebro).
2. **Ett enda köpflöde** — sök resa eller välj zon, priset visas, ett tryck till betalning.
3. **Biljetten alltid ett tryck bort** — stor QR/Aztec-vy, fungerar offline, maximal skärmljusstyrka automatiskt.
4. **Störningar där de är relevanta** — inline i reseförslag och på favoritlinjer, plus push för bevakade linjer. Inte en separat nyhetsflik man aldrig öppnar.
5. **Favoriter & widgets** — sparade resor/hållplatser, hemskärmswidget (iOS/Android) med nästa avgång, Live Activities på iOS för pågående resa.

## 3. Funktionell kravlista

### 3.1 Reseplanering & realtid
- Resesökning A→B (adress, hållplats, POI, "min position")
- Hållplatsvy med realtidsavgångar och perrong/läge
- Fordonspositioner live på karta
- Störningar/inställda avgångar integrerade i sökresultat
- Offline-cache av statisk tidtabell (GTFS) för sökning utan nät
- Avgångsbevakning: push X min innan avgång, push vid försening/inställd

### 3.2 Biljetter
- Biljettyper: enkel, 24h, 30 dagar (+ lågpris), Flex 10/40, prisgrupper (Ungdom 7–19, Student 20+, Vuxen, Senior 70+, Familj)
- **Köp nu, aktivera senare** (löser dagens största irritationsmoment)
- Signerad mobilbiljett enligt BoB/MTB — renderas som Aztec/QR som dagens validatorer ombord kan läsa
- **Offline-first**: biljetten lagras signerad lokalt, visas utan nätverk
- Animerad/tidsstämplad biljettvy (anti-skärmdump)
- Biljettdelning inom hushåll (skicka biljett till annan användare)
- Enhetsbyte utan 24h-spärr: device-bindning + riskbaserad kontroll (BankID-verifiering vid flytt i stället för tidsspärr)
- Köphistorik, kvitton, återköpsflöde enligt Länstrafikens regler

### 3.3 Betalning
- Swish (Swish Handel-API)
- Kort via PSP (Adyen/Stripe/Braintree) med Apple Pay + Google Pay
- Klarna för prenumeration/faktura (behåller dagens 12-för-10-erbjudande)
- Sparade betalsätt (tokeniserat hos PSP, aldrig kortdata i egen backend → minimal PCI DSS-scope, SAQ-A)
- PSD2/SCA-hantering

### 3.4 Konto & övrigt
- Konto valfritt för enkelbiljett, krävs för period (som idag)
- BankID för inloggning/verifiering
- Studentverifiering (Mecenat/Studentkortet-API)
- Tillgänglighet: VoiceOver/TalkBack, dynamisk textstorlek, WCAG 2.1 AA
- Språk: svenska + engelska
- GDPR: dataminimering, Region Örebro län som personuppgiftsansvarig

## 4. Datakällor & API:er

| Behov | Källa | Status |
|---|---|---|
| Reseplanerare A→B | ResRobot v2.1 Routeplanner (Trafiklab) | Öppet, gratis, stabilt |
| Avgångstavlor + hållplatssök | Trafiklab Realtime APIs (ersätter ResRobot Timetables, med realtid & perronger) | Öppet, CC-BY |
| Statisk tidtabell offline | GTFS Regional, operatör `orebro` (uppdateras dagligen 03–07) | Öppet, API-nyckel |
| Förseningar per avgång | GTFS-RT TripUpdates, `orebro` (var 15 s) | Öppet |
| Inställda avgångar & störningar | GTFS-RT ServiceAlerts, `orebro` (var 15 s) | Öppet |
| Bussar på kartan | GTFS-RT VehiclePositions, `orebro` (var ~3 s) | Öppet |
| Nyheter/driftinfo (redaktionellt) | Scrape/RSS från lanstrafiken.se alt. CMS-integration | Kräver dialog |
| Priser & zoner | Länstrafikens taxa — hårdkodas i MVP, API vid avtal | Kräver avtal |
| Biljettutfärdande & validering | BoB-standardens API:er (Samtrafiken) | Kräver avtal + BoB-deltagarskap |

**Attribution:** "Data från Trafiklab.se" måste visas (CC-BY).

## 5. Biljetter & QR — det kluriga, i detalj

BoB (Biljett- och Betalstandard, förvaltas av Samtrafiken) är implementerad i alla svenska kollektivtrafikområden. Nyckelkomponenter:

- **MTB (Mobile Ticket Bundle):** signerat biljettformat som renderas som 2D-kod (Aztec/QR). Validatorerna ombord (Ridango/Fara/Atron m.fl.) verifierar signaturen offline mot utgivarens publika nyckel.
- **Tickle:** språket som uttrycker biljettens giltighet (zon, tid, prisgrupp) kompakt.
- **Participant Metadata-databasen:** nationellt register hos Samtrafiken med alla deltagares publika nycklar. **Man måste vara registrerad deltagare för att ens biljetter ska accepteras av validatorer.**
- **BoB-API:erna** täcker hela kedjan: prisfråga → försäljning → utfärdande → validering → återköp → spärrning.

**Konsekvens:** Det finns ingen väg runt avtal med Region Örebro län för biljettdelen. Två realistiska integrationsmodeller:

**Modell A — Säljklient mot befintlig backend:** Appen blir ett nytt "sales client" som via BoB-API:er pratar med Länstrafikens befintliga biljettsystem (Infospreads backend). Minst arbete, snabbast till marknad, men beroende av Infospread.

**Modell B — Eget biljettsystem som BoB-deltagare:** Egen ticket issuer registrerad i Participant Metadata. Full kontroll, redundans mot leverantörshaverier (säljargument efter CrowdStrike-incidenten), men betydligt större ansvar (nyckelhantering/HSM, spärrlistor, kontrollantstöd).

**Rekommendation:** Modell A för pilot, med arkitektur förberedd för B.

## 6. Teknisk arkitektur

### App (crossplatform)
- **React Native (Expo)** eller **Flutter** — båda klarar kraven. RN rekommenderas: störst ekosystem, native-moduler för Swish/BankID/Apple Pay finns, enklare rekrytering vid överlämning till Region Örebro.
- Kartor: Mapbox eller MapLibre (öppet, ingen Google-låsning)
- Lokal lagring: SQLite (GTFS-cache) + Keychain/Keystore (biljetter, tokens)
- Offline-biljettrendering: signerad MTB lagras lokalt, renderas till Aztec utan nätverk
- Push: FCM + APNs; iOS Live Activities för pågående resa
- Widgets: WidgetKit (iOS) + Glance/AppWidget (Android)

### Backend (BFF — Backend For Frontend)
- **GTFS-ingest-tjänst:** hämtar `orebro`-feeden dagligen, bygger sökindex; pollar GTFS-RT (TripUpdates/ServiceAlerts/VehiclePositions) och pushar via WebSocket/SSE till appen
- **Störningsmotor:** matchar ServiceAlerts mot användarnas favoriter/bevakningar → push
- **Biljettjänst:** BoB-integration (modell A), orderhantering, kvitton
- **Betaltjänst:** Swish + PSP + Klarna, webhooks, reconciliation
- **Kontotjänst:** BankID, prisgruppsverifiering
- Stack: valfri, men Node/TypeScript eller Python (FastAPI) + Postgres + Redis räcker. Kubernetes onödigt i pilot — managed containers (Fly.io/Railway/Azure Container Apps; regionen kör sannolikt Azure).

### Robusthet (direkt säljargument)
- Biljetter fungerar offline även om backend ligger nere
- Realtidsdata degraderar gracefullt till statisk tidtabell
- Multi-region backend, statuspage, ingen enskild tredjepartsberoende i biljettvisning

## 7. Affärsverklighet — viktigt innan du kodar för mycket

- **Region Örebro län är en myndighet → LOU.** De kan inte "köpa din app" rakt av över tröskelvärdena. Realistiska vägar: (a) direktupphandling under tröskel för pilot/förstudie, (b) innovationspartnerskap, (c) svara när nuvarande avtal med Infospread upphandlas om, (d) sälja till flera län via Infospread-konkurrenter.
- **Kontaktpunkt:** Johan Ljung, områdeschef kollektivtrafik, Region Örebro län (uttalade sig vid 2024-incidenten). Ta reda på när Infospread-avtalet löper ut (offentlig handling — begär ut det).
- **MVP utan avtal är fullt lagligt:** reseplanerare + realtid + störningar bygger helt på öppna Trafiklab-data. Det är din demo och ditt förhandlingskort.

## 8. Fasplan

**Fas 0 — Validering (1–2 veckor)**
- Begär ut nuvarande avtal med Infospread (avtalstid, kostnad) via offentlighetsprincipen
- Trafiklab-konto + API-nycklar, ladda ner `orebro` GTFS, verifiera datakvalitet
- Boka möte med Länstrafiken: presentera problembild (recensioner, 2024-incidenten, 24h-spärren)

**Fas 1 — MVP: Reseplanerare (4–8 veckor)** ← *detta repo*
- RN/Flutter-app: hållplatssök, avgångstavla med realtid, resesök A→B, störningar inline, karta med bussar live
- Endast öppna data. Släpp som egen app eller behåll som demo.

**Fas 2 — Störningsintelligens (2–4 veckor)**
- Favoriter, bevakningar, push vid försening/inställd, widgets

**Fas 3 — Biljetter (kräver avtal; 8–16 veckor efter avtal)**
- BoB-integration modell A, biljettköp, offline-rendering, köp-nu-aktivera-senare, enhetsbyte utan spärr, biljettdelning

**Fas 4 — Betalning & konto (parallellt med fas 3)**
- Swish, Apple/Google Pay, Klarna-prenumeration, BankID, studentverifiering

**Fas 5 — Härdning & överlämning**
- Biljettkontrollant-flöde, tillgänglighetsrevision, penetrationstest, GDPR-DPIA, drift-SLA

## 9. Öppna frågor
1. När löper Infospread-avtalet ut? (Avgör hela tidsplanen — begär ut.)
2. Vill regionen äga koden eller köpa som tjänst (SaaS)?
3. Tågbiljetter inom länet (Tåg i Bergslagen m.fl.) — ingår i scope eller ej?
4. Serviceresor/färdtjänst — separat app idag; håll utanför scope v1.
5. BoB-deltagarskap: kostnad och ledtid hos Samtrafiken (kontakta help.samtrafiken.se).

## Nästa steg (konkret)
1. Skapa Trafiklab-konto, hämta `orebro`-GTFS + RT-feeds, bygg en throwaway-prototyp av avgångstavlan → validerar datakvaliteten på en kväll.
2. Skicka begäran om allmän handling till Region Örebro län: avtal + kostnader för nuvarande biljettapp.
3. Anmäl dig till Samtrafikens digitala BoB-grundutbildning (gratis intro till standarden).
