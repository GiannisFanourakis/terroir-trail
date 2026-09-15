-- Phase 10B visitability refinement from current first-party pages.

UPDATE public.producers
SET visit_status = 'public_visits',
    visit_source_url = 'https://www.tetramythoswines.com/en/contact/',
    visit_notes = 'Current first-party contact page publishes tasting-room hours throughout the week. The winery also advertises guided tours; contact the winery directly for current tour arrangements.',
    opening_hours = 'Tasting room: Mon-Fri 08:00-16:00; Sat-Sun 09:00-14:00.'
WHERE id = 'tetramythos-winery';

UPDATE public.producers
SET visit_source_url = 'https://www.monemvasiawinery.gr/en/contact/',
    visit_notes = 'Current first-party contact page publishes winery opening hours; the tour/tasting programme requires a reservation.',
    opening_hours = 'Tue-Fri 10:00-17:00; Sat 10:00-16:00; Mon and Sun closed; reservation required for tour/tasting.'
WHERE id = 'monemvasia-winery';
