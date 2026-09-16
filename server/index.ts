import 'dotenv/config';
import { app } from './app';
import { registerAdminMediaRoutes } from './adminMediaRoutes';
import { registerProducerMediaRoutes } from './producerMediaRoutes';

registerAdminMediaRoutes(app);
registerProducerMediaRoutes(app);

const port = Number(process.env.PORT || 4242);
app.listen(port, '0.0.0.0', () => {
  console.log(`TerroirTrail API listening on http://0.0.0.0:${port}`);
});