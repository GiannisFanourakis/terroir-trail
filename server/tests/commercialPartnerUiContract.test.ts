import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const hostSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/Portal/ProducerPromotionPanel.tsx'),
  'utf8'
);
const adminSource = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/Admin/AdminCommercialPartnerPanel.tsx'),
  'utf8'
);

test('Host promotions UI keeps paid distribution separate from trust and outcome claims', () => {
  assert.match(hostSource, /Paid promotion is separate from your free listing/);
  assert.match(hostSource, /organic producer ordering/);
  assert.match(hostSource, /do not represent confirmed bookings, visits or revenue/);
  assert.match(hostSource, /Early signal · low volume/);
  assert.doesNotMatch(hostSource, /isProTier|is_pro_tier/);
});

test('Admin commercial UI requires review context and exposes audit/subscription state', () => {
  assert.match(adminSource, /Paid placement preview/);
  assert.match(adminSource, /compare this promotional copy with the producer's current canonical visitor facts/);
  assert.match(adminSource, /Required review note for approve\/reject/);
  assert.match(adminSource, /Recent commercial audit/);
  assert.match(adminSource, /No Stripe subscription record/);
  assert.doesNotMatch(adminSource, /isProTier|is_pro_tier/);
});
