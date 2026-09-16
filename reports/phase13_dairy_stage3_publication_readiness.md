# Phase 13 — Greek Cheese & Dairy Expansion: Stage 3 Publication Readiness

Date: 2026-09-16

## Purpose

This document records the publication-readiness gate after the owner-approved 16-producer shortlist and Stage 2 identity/product/contact audit.

It is deliberately stricter than a directory check. A producer can be real, have a valid address and publish genuine products while still being **not ready for a TerroirTrail map pin**. The public catalogue requires a resolved mapped point whose role is understood. Retail shops, offices, village centres and similarly named businesses must not be substituted for a production site.

No candidate in this document is authorized for live import merely because a Google business identity or public address exists.

## Publication states

- **IDENTITY RESOLVED / PIN DATA PENDING** — Google business identity strongly matches first-party producer/address/contact evidence, but exact coordinates still need to be captured and manually checked before persistence.
- **ADDRESS RESOLVED / GOOGLE ID PENDING** — production address or route is strong, but a trustworthy matching Google business identity has not yet been isolated.
- **ROLE COLLISION** — search results currently resolve to a shop, reseller, office or unrelated business; do not use that result as the production pin.
- **HOLD** — insufficient point-level evidence for import.

Road access remains `not_publicly_confirmed` for every new candidate until a separate access audit establishes surface/width/vehicle suitability. Google/business opening hours do not establish tour access.

---

## A. Identity resolved / pin data pending

### Psiloritis Cheese Dairy — Livadia Mylopotamou, Rethymno

**State:** IDENTITY RESOLVED / PIN DATA PENDING

First-party evidence confirms the dairy at Livadia Mylopotamou, its 2007 move to new facilities, phone `28340 61716`, email `info@psiloriths.gr`, and its Cretan dairy product range.

A current Google business result resolves to:

- Name: `Τυροκομείο "Ψηλορείτης"`
- Google Place ID: `ChIJIZTR0koHmxQRQqWZvFNSOGU`
- Address: `Epar.Od. Agiou Silla-Axou 313, Livadia 740 51, Greece`
- Phone: `+30 2834 061716`
- Category: Food manufacturer

The phone and Livadia identity match the producer-controlled source strongly. Capture and manually inspect the exact coordinates before persistence.

First-party sources:
- https://www.psiloriths.gr/en/the-company/
- https://www.psiloriths.gr/en/home/
- https://www.psiloriths.gr/epikinonia/

**Visit status:** `not_publicly_confirmed`. The producer publishes operating/contact hours, but that does not establish public production-floor visits, tastings or walk-ins.

**Point role target:** `production_site` if the final map inspection confirms the business pin is the current post-2007 dairy facility.

---

### Stamatogiorgis Dairy — Smari, Heraklion

**State:** IDENTITY RESOLVED / PIN DATA PENDING

Current first-party evidence confirms the dairy in Smari Pediados, phone `6973423040`, email `info@stamatogiorgis.gr`, local-milk cheese/dairy production, and tasting experiences at its facilities.

A matching Google business identity resolves to:

- Name: `Stamatogiorgis Cretan Cheese & Dairy Products`
- Google Place ID: `ChIJDZQB-RFhmhQRcsREVVyuhSQ`
- Address: `Smari 700 06, Greece`
- Phone: `+30 697 342 3040`
- Categories: Cheese shop / Tourist attraction

A long-running 4ty listing independently matches Smari, the mobile phone, the dairy identity and states that the cheese dairy/tasting-room setup is for visitors.

Sources:
- https://stamatogiorgis.gr/en/
- https://stamatogiorgis.4ty.gr/en/STAMATOGIORGIS%20-%20DAIRY%20PRODUCTS%20HERAKLION%20CRETE%20-%20TRADITIONAL%20PRODUCTS%20-%20CHEESE%20PRODUCTS?l=en

**Visit status:** HOLD FOR CURRENT PROCEDURE. Positive visitor/tasting evidence exists, but current walk-in policy, booking method and ordinary visitor hours are not sufficiently explicit to publish `public_visits` yet.

**Point role target:** likely `production_site` if manual map inspection confirms the Google point is the dairy/tasting location rather than a separate shop.

**Source-quality warning:** the current producer website contains obvious generic/template filler in unrelated sections. Use the producer identity, contact, product and explicit tasting text only; do not inherit placeholder FAQ/people/phone content.

---

### ELATOS / Kapetanou Bros — Schinochori, Argos

**State:** IDENTITY RESOLVED / PIN DATA PENDING

Producer-controlled material confirms the third-generation dairy, production location at Alogomandra Schinochoriou, Argos, and current producer phones.

A matching Google business identity resolves to:

- Name: `Kapetanou, D., Bros, O.E.`
- Google Place ID: `ChIJce0j3iH-nxQRSYbQZyh7_Q0`
- Address: `Σχινοχώρι 212 00, Greece`
- Phone: `+30 2751 022718`
- Category: Wholesaler

The identity/address/legacy landline are consistent with the producer record, but the category is generic. Manual map inspection is still required to prove the point corresponds to the dairy facilities.

Source:
- https://afoikapetanou.gr/

**Visit status:** `not_publicly_confirmed`.

**Point role target:** `production_site` only after manual confirmation.

---

### Arvanitis Dairy — Neochorouda, Thessaloniki

**State:** IDENTITY RESOLVED / PIN DATA PENDING

The producer publishes its fromagerie at Symmachiki Odos / Neochorouda 54500 and phone `+30 2310 709559`.

A matching Google business identity resolves to:

- Name: `Arvanitis Cheese Factory S.A.`
- Google Place ID: `ChIJ8VOFJRcxqBQR5ROjidyM_FI`
- Address: `ΣΥΜΜΑΧΙΚΗ ΟΔΟΣ, Neochorouda 545 00, Greece`
- Phone: `+30 231 070 9559`
- Category: Cheese manufacturer

This is a strong production-site identity match. A separate public Arvanitis store at Agora Modiano must remain a different `producer_shop` entity if it is ever surfaced.

Sources:
- https://arvanitis.gr/en/
- https://arvanitis.gr/en/company/the-company/

**Visit status:** `not_publicly_confirmed` for the factory. Business hours or reviews are not treated as proof of tours or ordinary production-site access.

**Point role target:** `production_site` after coordinate/manual pin confirmation.

---

## B. Strong production address / Google identity still pending

### Baladinos & Sons — Varipetro, Chania

**State:** ADDRESS RESOLVED / GOOGLE ID PENDING

First-party evidence explicitly states that all production moved to modern privately owned facilities in Varipetro in 2014. The official contact structure separates the Varipetro factory from the Skalidi 25 central Chania store.

Independent current directory evidence also lists `BALANTINOS`, Varypetro 73500, phone `+30 28210 33030`, as manufacturing/dairy production.

**ROLE COLLISION:** Google currently resolves a clear Balantinos retail identity at Skalidi 25 in Chania (`ChIJq117gb19nBQR0We4DTt-XNc`). That is the store, not the Varipetro factory. Do not persist it as the dairy production point.

Sources:
- https://www.balantinos.gr/en/contact/
- https://www.balantinos.gr/en/quality/
- https://www.xo.gr/profile/profile-911630231/en/

**Visit status:** `not_publicly_confirmed` for the factory.

---

### Katsouli Cheese Factory — Koliaki / Trachia, Argolida

**State:** ADDRESS RESOLVED / GOOGLE ID PENDING

First-party contact data publishes the dairy at `Epar.Od. Old Epidaurus - Tracheia, Koliaki, Argolida, 21052`, phone `2753071363`, mobile `6980908616`, email `info@katsouli.gr`.

**ROLE COLLISION:** a Google result for `Katsouli, Garyfallia - Thomas Katsoulis O.E.` resolves to Sidiras Merarchias 43 in Nafplio and is categorized as a bakery. It must not be used as the Koliaki dairy pin.

Sources:
- https://katsou.gr/en/ABOUT-US
- https://katsou.gr/en/Contact
- https://katsou.gr/en/homepage-Tyrokomeio-Katsoyli

**Visit status:** `not_publicly_confirmed`. Marketing language describing the dairy as a cheese-factory destination is not enough to establish tours or walk-in production access.

---

### O Polyfimos — Eva, Messinia

**State:** ADDRESS RESOLVED / GOOGLE ID PENDING

Producer-controlled material identifies the dairy in Eva and separately identifies public retail points.

**ROLE COLLISION:** a Google result for `ΤΥΡΟΚΟΜΕΙΟ ΠΟΛΥΦΗΜΟΣ` resolves to `Dim. Koutsika 32, Messini 24200`, matching the retail/customer-facing network rather than proving the Eva production site. Do not substitute it for the dairy.

Sources:
- https://www.polyfimos.gr/
- https://www.polyfimos.gr/επικοινωνία

**Visit status:** `not_publicly_confirmed` for the dairy.

---

### Tsatsoulis Cheese — Panagitsa, Arcadia

**State:** HOLD / ROLE COLLISION

First-party material identifies Panagitsa 22002 as the producer locality/address.

A current Google result for `ΤΣΑΤΣΟΥΛΗΣ ΝΙΚ. & ΥΙΟΙ Ο.Ε` resolves to Vytina 22010 and is categorized as a dairy store. That may be a retail/public point but is not sufficient evidence for the Panagitsa production facility.

Sources:
- https://www.tsatsoulis.com.gr/
- https://www.tsatsoulis.com.gr/about
- https://www.tsatsoulis.com.gr/products

**Visit status:** `not_publicly_confirmed` for the production site.

---

### GYPAS / Gyparaki Bros — Asi Gonia, Chania

**State:** ADDRESS/LOCALITY RESOLVED / GOOGLE ID PENDING

The producer explicitly describes the current 3,000 m² creamery at the edge of Asi Gonia. Current business search did not isolate a trustworthy creamery result; village-level results must not be used as a substitute.

Sources:
- https://www.gypas.gr/en/
- https://www.gypas.gr/en/the-creamery
- https://www.gypas.gr/en/products

**Visit status:** `not_publicly_confirmed`.

---

### KARGAKIS Dairy Products — Anopoli, Heraklion

**State:** ADDRESS/LOCALITY RESOLVED / GOOGLE ID PENDING

The producer publishes Anopoli, Heraklion 70008 and phone `+30 2810 342687`. Current business search produced unrelated Anopoli businesses rather than a reliable KARGAKIS production identity.

Sources:
- https://kargaki.gr/?lang=en
- https://kargaki.gr/about-us/?lang=en

**Visit status:** `not_publicly_confirmed`.

---

### ARGOGAL / Koromichi Family — Kefalari, Argos

**State:** ADDRESS/LOCALITY RESOLVED / GOOGLE ID PENDING

First-party evidence supports modern facilities in Kefalari, Argos 21250. Current structured business search did not isolate a reliable ARGOGAL production point; unrelated `Kefalari` results must be rejected.

Sources:
- https://www.argogal.gr/en/
- https://www.argogal.gr/en/company
- https://www.argogal.gr/en/contact

**Visit status:** `not_publicly_confirmed`.

---

### Agricultural Dairy Cooperative of Kalavryta

**State:** HOLD — MULTIPLE PUBLIC ROLES

The cooperative publishes separate central offices, cheese-production facilities and branch stores. Current structured search surfaces public Kalavryta retail/visitor businesses but has not yet isolated the cheese factory identity with sufficient confidence.

Sources:
- https://www.kalavritacoop.gr/en
- https://www.kalavritacoop.gr/who-we-are
- https://www.kalavritacoop.gr/cheese-factory

**Rule:** do not pin the central office or a branch store as the production site.

**Visit status:** `not_publicly_confirmed` for the factory.

---

### Vogiatzis Traditional Cheeses of Lagadas — Perivolaki

**State:** ADDRESS/LOCALITY RESOLVED / GOOGLE ID PENDING

First-party evidence confirms the Perivolaki factory/address and family business. Current structured search returned unrelated Vogiatzis businesses rather than a trustworthy dairy identity.

Sources:
- https://www.feta-vogiatzis.gr/en
- https://www.feta-vogiatzis.gr/en/company/profile
- https://www.feta-vogiatzis.gr/en/contact

**Visit status:** `not_publicly_confirmed`.

---

### Karagiannis Theofilos Dairy Products — Arnaia, Chalkidiki

**State:** ROUTE/LOCALITY RESOLVED / GOOGLE ID PENDING

The producer confirms the dairy facilities north of Arnaia, and current directory evidence supports the Arnaia–Apollonia road context. Structured business search has not isolated a trustworthy factory identity; unrelated people/businesses using `Theofilos` or `Karagiannis` must be rejected.

Sources:
- https://www.karagiannifeta.gr/en/about
- https://www.karagiannifeta.gr/en/home

**Visit status:** `not_publicly_confirmed`.

---

### Christakis / Patria Feta — Proastio, Edessa

**State:** ADDRESS RESOLVED / GOOGLE ID PENDING

First-party evidence publishes the factory at the 3rd km Edessa–Flamouria road, Proastio Edessas 58200, phone `+30 23810 28703` and email `info@patriafeta.com`. Structured business search has not yet isolated a reliable Patria factory point; other Edessa dairy businesses are unrelated.

Sources:
- https://www.patriafeta.com/
- https://www.patriafeta.com/index.php/information
- https://www.patriafeta.com/index.php/products

**Visit status:** `not_publicly_confirmed`.

---

### O Mythos tou Vounou — Kato Oreini, Serres

**State:** STRONG PUBLIC-FACING ADDRESS / EXACT BUSINESS ID PENDING

The producer publishes a dairy at Kato Oreini, Serres 62100, phone numbers, email, current dairy hours (Mon–Sat 09:00–18:00) and direct driving context from Serres toward Lailias. It also explicitly separates the dairy from 27 selected sales points.

Sources:
- https://omythostouvounou.gr/en/
- https://omythostouvounou.gr/en/about
- https://omythostouvounou.gr/en/products
- https://omythostouvounou.gr/en/locations

Structured business search has not yet isolated the dairy itself with a trustworthy Google Place ID. Do not use a Kato Oreini village point or one of the listed resellers.

**Visit status:** HOLD FOR ROLE CONFIRMATION. Published dairy hours and directions are strong evidence of a public-facing point, but they do not explicitly promise production tours or tastings. A future record may publish the hours only if the mapped point is confirmed to be the producer-controlled public dairy point.

---

## Stage 3 checkpoint

### Google identities strongly matched

1. Psiloritis Cheese Dairy — `ChIJIZTR0koHmxQRQqWZvFNSOGU`
2. Stamatogiorgis Dairy — `ChIJDZQB-RFhmhQRcsREVVyuhSQ`
3. ELATOS / Kapetanou Bros — `ChIJce0j3iH-nxQRSYbQZyh7_Q0`
4. Arvanitis Cheese Factory — `ChIJ8VOFJRcxqBQR5ROjidyM_FI`

These are **not yet imported** because the database requires exact coordinates and TerroirTrail still needs a manual point-role check before persistence.

### Explicit collisions quarantined

- Baladinos central Chania shop ≠ Varipetro factory.
- Katsouli Nafplio result ≠ Koliaki/Trachia dairy.
- O Polyfimos Messini result ≠ Eva dairy unless later evidence proves otherwise.
- Tsatsoulis Vytina dairy store ≠ automatically the Panagitsa production site.
- Kalavryta office/branches ≠ automatically the cheese factory.
- Arvanitis Agora Modiano store ≠ Neochorouda factory.

### Current import-ready count

**0 of 16.**

This is intentional. Four records have strong identity matches, but TerroirTrail does not manufacture coordinates or silently convert a business/search result into a production-site pin. The next audit action is exact coordinate capture/manual map confirmation for those four first, followed by the strong-address group.

## UI prerequisite before first import

The producer drawer still contains generic dairy assumptions inherited from the earlier two-record Cretan implementation (`mitato`, `mountain cheeses`, generic cave-aged/vacuum-sealed delivery language) and still renders legacy `indigenousVarieties` directly. Before the first Phase 13 dairy record is published, the UI must:

1. render `productSpecialties` through the Phase 13 specialty helper;
2. use neutral dairy terminology such as `Cheeses & Dairy Products`, `Products & Specialties`, and `Dairy Highlights`;
3. avoid generic claims about shepherds, mitata, mountain production, cave ageing, packaging, delivery or specific cheese types unless the individual producer record supports them;
4. expose a direct producer shop only when an actual producer-controlled shop URL is supplied.

No Phase 13 producer should go live before that UI trust cleanup passes the normal quality gate.