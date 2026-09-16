import 'dotenv/config';
import { app } from './app';
import { registerAccountSelfRoutes } from './accountSelfRoutes';
import { registerAdminAccountRoutes } from './adminAccountRoutes';
import { registerAdminListingChangeRoutes } from './adminListingChangeRoutes';
import { registerAdminMediaRoutes } from './adminMediaRoutes';
import { registerAdminReviewRoutes } from './adminReviewRoutes';
import { registerProducerListingChangeRoutes } from './producerListingChangeRoutes';
import { registerProducerMediaRoutes } from './producerMediaRoutes';
import { registerReviewRoutes } from './reviewRoutes';

registerAdminMediaRoutes(app);
registerAdminListingChangeRoutes(app);
registerAdminReviewRoutes(app);
registerAdminAccountRoutes(app);
registerProducerMediaRoutes(app);
registerProducerListingChangeRoutes(app);
registerReviewRoutes(app);
registerAccountSelfRoutes(app);

const port = Number(process.env.PORT || 4242);
app.listen(port, '0.0.0.0', () => {
  console.log(`TerroirTrail API listening on http://0.0.0.0:${port}`);
});