# Phase 10A — Santorini Google Place & Location Audit

Date: 2026-09-15

Status: **applied to production Supabase and recorded in repository migration**.

Migration: `supabase/migrations/20260915103000_phase10a_santorini_google_place_location_audit.sql`

## Audit rule

A manually matched Google business listing may verify the producer/business location when identity and locality are corroborated, but it does **not** by itself verify entrance-level precision, road surface, road width, road condition, or rental-car suitability.

For that reason the legacy Santorini `road_access = paved` values were cleared during this location correction. All nine records now keep road type unknown with `road_access_status = not_publicly_confirmed` until an independent road-access audit is completed.

## Persisted Google matches

| Producer | Google business match | Google Place ID | Persisted coordinates |
| --- | --- | --- | --- |
| Canava Santorini Distillery | Canava Museum Santorini | `ChIJ5YMrxW_OmRQRk0po0X3EDuM` | `36.3974300, 25.4398730` |
| Domaine Sigalas | Domaine Sigalas | `ChIJu7u3b4DLmRQRpxve6-VHUd0` | `36.4714413, 25.3941458` |
| Estate Argyros Santorini | Estate Argyros | `ChIJD8Ll3xfOmRQRDhaOcljaawQ` | `36.3830929, 25.4647308` |
| GAIA Wines Santorini | Gaia Winery \| Santorini | `ChIJxwtdmPDRmRQRvv2sLef21bU` | `36.3913453, 25.4857922` |
| Gavalas Winery Santorini | Gavalas Winery | `ChIJtTl4tVbOmRQR3jJOJZ5Hrac` | `36.3755559, 25.4305407` |
| Santorini Brewing Company | Santorini Brewing Company | `ChIJ30mo9xjOmRQRSFZDLJsvVy4` | `36.3841336, 25.4644929` |
| Vassaltis Vineyards Santorini | Vassaltis Vineyards | `ChIJVX4lYq_NmRQR1_VKq8vhjd8` | `36.4425450, 25.4376770` |
| Santo Wines Cooperative | Santo Wines | `ChIJFbhZ3F7OmRQReOlBpwauSzg` | `36.3875640, 25.4367460` |
| Venetsanos Winery Santorini | Venetsanos Winery | `ChIJTy6LeFnOmRQRkX31v9sqMWo` | `36.3823401, 25.4315203` |

## Ambiguity decisions

### Canava

Google currently presents the business as **Canava Museum Santorini**. Current independent Santorini sources identify that Mesaria museum as the visitor space on the premises of the Canava Santorini distillery, so the listing was accepted for the existing distillery/museum record. This verifies the operating location, not a separate entrance classification.

### Santorini Brewing Company

Google returned two nearby candidates: **Donkey brewery** and **Santorini Brewing Company**. The second candidate was persisted because its displayed business name matches the producer's current official identity, while the official producer site independently confirms the brewery is in Mesa Gonia. The nearby Donkey-branded listing was deliberately not stored.

### GAIA Wines Santorini

The old TerroirTrail pin was materially north of the current Google business point. The corrected point at `36.3913453, 25.4857922` is consistent with GAIA's current first-party description of the winery at Vrachies of Exo Gonia, on eastern Santorini between Kamari and Monolithos.

## Production verification

A post-update query confirmed all 9 Santorini rows now have:

- the audited coordinates above;
- a non-null audited `google_place_id`;
- `location_status = verified_location`;
- `road_access = NULL`;
- `road_access_status = not_publicly_confirmed`.

No Experience activation, partnership state, booking state, or commercial feature was changed.
