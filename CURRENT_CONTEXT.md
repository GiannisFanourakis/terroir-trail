# TerroirTrail Active Operational Context (CURRENT_CONTEXT)
*Last Updated: 2026-10-14T11:05:00+03:00 | Chief of Staff: Terra | Owner: Giannis*

---

## 1. Governance & Core Invariants
- **The Paid-Partner Invariant**: **"Never advertise individual producers without them paying."**
  - Organic catalog listing on the map is unbiased, open, and free.
  - Dedicated social media carousels, reels, spotlights, or advertorial campaigns for a single producer are strictly forbidden unless certified as a paying commercial partner.
  - Editorial content focuses on seasonal traditions, agricultural crafts, regional terroir, and multi-producer discovery.
- **The Human-in-the-Loop Gate**: Zero autonomous publishing. All social posts, external emails, and database mutations require explicit written sign-off from Giannis.
- **Data Truth ("Unknown stays unknown")**: Never hallucinate hours, prices, tasting packages, or visitability. Production sites != visitor centers.
- **Cartography Protocol**: All imported points must satisfy the Two-Stage Verification Protocol (`AGENTS.md`) with direct Google Maps `/maps/place/...` URLs, Place IDs, and canonical `!3d!4d` pins. Fail-closed road access.

---

## 2. Published & Settled Social Media Timeline

| Week # | Scheduled Date | Topic / Heritage Craft | Geography | Publishing State |
| :--- | :--- | :--- | :--- | :--- |
| **Week 42** | **Mon, 12 Oct 2026** | **Piedmont Autumn Terroir** | Langhe & Roero (Italy) | **PUBLISHED** on Oct 12 *(Do NOT re-feature)* |
| **Week 43** | **Mon, 19 Oct 2026** | **Agourelaio (Early Harvest EVOO)** | Crete & Istria | **Staged & Verified** (`01_Week_43_Mon_Oct19_Early_Harvest_Olive_Oil`) |
| **Week 44** | **Mon, 26 Oct 2026** | **Cretan Mitata & Mountain Dairies** | Psiloritis & Lefka Ori (Crete) | **Staged & Verified** (`02_Week_44_Mon_Oct26_Cretan_Mitata_Mountain_Dairies`) |
| **Week 45** | **Mon, 02 Nov 2026** | **The New Wine (Ai Giorgis Methystis)** | Greece, Portugal & Italy | **Staged & Verified** (`03_Week_45_Mon_Nov02_The_New_Wine_San_Martino`) |
| **Week 46** | **Mon, 09 Nov 2026** | **Glacial Fjord Cider** | Hardangerfjord & Vestland (Norway) | **Staged & Verified** (`04_Week_46_Mon_Nov09_Glacial_Fjord_Cider`) |
| **Week 47** | **Mon, 16 Nov 2026** | **Copper Pomace Distillation (Kazania)** | Crete & Thessaly (Greece) | **Staged & Verified** (`05_Week_47_Mon_Nov16_Copper_Pomace_Distillation`) |
| **Week 48** | **Mon, 23 Nov 2026** | **High Alpine Winter Dairies** | South Tyrol & Swiss Alps | **Staged & Verified** (`06_Week_48_Mon_Nov23_Alpine_Cheese_Dairies`) |
| **Week 49** | **Mon, 30 Nov 2026** | **Iberian Stone Mill Harvest** | Alentejo & Andalusia | **Staged & Verified** (`07_Week_49_Mon_Nov30_Iberian_Stone_Mill_Harvest`) |
| **Week 50** | **Mon, 07 Dec 2026** | **Dark Winter Pine & Thyme Apiaries** | Chalkidiki, Taygetos, Crete | **Staged & Verified** (`08_Week_50_Mon_Dec07_Dark_Winter_Apiaries`) |

---

## 3. Active Multi-Agent Workforce Infrastructure
- **Lead Operations (Terra)**: Orchestrates subagents, prepares daily briefs, maintains context (`.agents/terra.md`).
- **Cloud Secretary (Google Apps Script)**: Runs 24/7 in Google's cloud. Hourly inbox triage (`terroirtrail@gmail.com`), daily 08:45 AM briefing email.
- **Cloud Visual Factory (GitHub Actions Cron)**: Runs every Monday at 09:00 AM (Europe/Athens). Executes Clio (rendering) and Aletheia (auditing) in the cloud with zero PC dependency (`.github/workflows/workforce-cron.yml`).
- **Google ADK Framework (`workforce/terroir_adk/agent.py`)**: Google's official Agent Development Kit powering local web playground (`adk web`) and Cloud Run deployability.
- **Unified Control CLI (`tools/workforce.py`)**: Central command center for status, sync, audits, and agent invocation.
