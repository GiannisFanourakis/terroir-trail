import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGmailAlignedMimeMessage } from '../services/transactionalEmailTransport';

test('transactional Gmail Message-ID aligns with authenticated sender domain', () => {
  const result = buildGmailAlignedMimeMessage(
    {
      to: 'traveler@example.com',
      subject: 'Welcome to TerroirTrail',
      text: 'Welcome to TerroirTrail',
      html: '<p>Welcome to TerroirTrail</p>',
    },
    'terroirtrail@gmail.com'
  );

  assert.match(result.messageId, /^[0-9a-f-]+@gmail\.com$/i);
  assert.match(result.message, /From: TerroirTrail <terroirtrail@gmail\.com>/);
  assert.match(result.message, /Reply-To: terroirtrail@gmail\.com/);
  assert.match(result.message, /Message-ID: <[0-9a-f-]+@gmail\.com>/i);
  assert.doesNotMatch(result.message, /@terroirtrail\.app/);
});
