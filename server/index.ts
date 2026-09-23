import 'dotenv/config';
import { app } from './app';
import { registerAccountSelfRoutes } from './accountSelfRoutes';
import { registerAdminAccountRoutes } from './adminAccountRoutes';
import { registerAdminListingChangeRoutes } from './adminListingChangeRoutes';
import { registerAdminMediaRoutes } from './adminMediaRoutes';
import { registerAdminReviewRoutes } from './adminReviewRoutes';
import { registerAdminIntentRoutes } from './adminIntentRoutes';
import { registerProducerListingChangeRoutes } from './producerListingChangeRoutes';
import { registerProducerMediaRoutes } from './producerMediaRoutes';
import { registerReviewRoutes } from './reviewRoutes';
import { registerAnalyticsRoutes } from './analyticsRoutes';
import { registerTripRoutes } from './tripRoutes';
import { registerCommercialPartnerRoutes } from './commercialPartnerRoutes';

registerAdminMediaRoutes(app);
registerAdminListingChangeRoutes(app);
registerAdminReviewRoutes(app);
registerAdminIntentRoutes(app);
registerAdminAccountRoutes(app);
registerProducerMediaRoutes(app);
registerProducerListingChangeRoutes(app);
registerReviewRoutes(app);
registerAccountSelfRoutes(app);
registerAnalyticsRoutes(app);
registerTripRoutes(app);
registerCommercialPartnerRoutes(app);

const port = Number(process.env.PORT || 4242);
app.listen(port, '0.0.0.0', () => {
  console.log(`TerroirTrail API listening on http://0.0.0.0:${port}`);
});