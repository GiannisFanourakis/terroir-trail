import 'dotenv/config';
import { app } from './app';

const port = Number(process.env.PORT || 4242);
app.listen(port, () => {
  console.log(`TerroirTrail API listening on http://localhost:${port}`);
});
