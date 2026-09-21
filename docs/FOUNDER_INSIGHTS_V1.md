# Founder Insights V1 Metric Contract

**Status:** Metric requirements locked for producer validation. This document defines the minimum producer-facing analytics TerroirTrail should aim to provide. It does not authorize collection of new personal data by itself.

## 1. Reach

Required:
- profile views;
- unique visitor sessions.

Purpose: distinguish repeated page activity from the approximate number of separate browsing sessions showing interest.

## 2. Audience

Required:
- visitor country at country level only;
- browser/interface language.

Rules:
- visitor country means coarse geography of the session, not nationality or citizenship;
- never expose an IP address;
- never expose individual traveler geography;
- small country/language segments must be grouped into `Other` or withheld;
- do not add city/sub-country geography until producer demand and privacy review justify it.

## 3. Acquisition

Required:
- internal TerroirTrail discovery surface;
- coarse external acquisition channel when measurable.

Target source groups:
- TerroirTrail map/discovery;
- destination/region page;
- direct/deep link;
- organic search;
- referral;
- other/unknown.

Do not store or expose arbitrary full referral URLs merely to create a producer metric.

## 4. Planning

Required:
- saves;
- trip additions.

These are consideration/planning signals. They are not bookings or confirmed visits.

## 5. Intent actions

Required:
- producer website clicks;
- phone actions;
- email actions;
- directions actions.

Show a combined headline action count only if the individual components remain available underneath.

## 6. Trend

Required:
- explicit reporting window;
- time-series trend;
- immediately preceding equal-length period.

Do not manufacture percentage-growth claims where tiny denominators make them misleading. Absolute change is acceptable for low-volume periods.

## 7. Context

Secondary, not headline:
- category context;
- regional context.

Only show when minimum sample thresholds are met. Context must never become an editorial ranking, quality score or paid-placement signal.

## 8. Optional additions after producer validation

Do not treat these as V1 requirements until producers demonstrate an operational need:
- planning lead time;
- seasonality detail;
- booking-page clicks/conversion;
- first-time vs returning interest;
- device detail;
- sub-country geography;
- party size;
- traveler-language needs beyond browser/interface language;
- alerts/anomaly detection;
- scheduled monthly summaries.

## 9. Current implementation status

Already measured:
- profile views;
- saves;
- trip additions;
- website clicks;
- phone actions;
- email actions;
- directions actions;
- internal source surface;
- reporting windows/equal-window trend.

Derivable but not yet exposed:
- unique sessions from pseudonymous session keys.

Not currently collected:
- visitor country;
- visitor language;
- external acquisition/referrer channel.

Important: the existing analytics `country_code` identifies the **producer/destination country**. It must never be presented as visitor geography.

## 10. Validation rule

The V1 set is the starting point, not the final product. During producer interviews ask:

> Which one of these metrics would cause you to make a different decision, and what additional information would make that decision easier?

Only repeated operational needs should graduate into additional telemetry or product work.
