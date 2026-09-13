import fs from 'node:fs';
import path from 'node:path';

const targetFiles = [
  'src/components/Auth/AuthModal.tsx',
  'src/hooks/useAuth.ts',
  'src/components/Portal/ProducerPortalModal.tsx',
  'src/components/Portal/ProducerRegistrationForm.tsx',
  'src/components/Drawer/ProducerDetailDrawer.tsx',
  'server/tests/approveProducerRegistration.spec.ts',
] as const;

const backups = new Map<string, string>();
for (const file of targetFiles) {
  backups.set(file, fs.readFileSync(path.resolve(file), 'utf8'));
}

function restoreBackups() {
  for (const [file, content] of backups) {
    fs.writeFileSync(path.resolve(file), content);
  }
}

async function run() {
  // The visible claim heading shares its old wording with a source-code comment.
  // Rename only the comment first so the guarded implementation can uniquely
  // target the user-facing heading. This pre-step is included in the rollback.
  const authFile = 'src/components/Auth/AuthModal.tsx';
  const authPath = path.resolve(authFile);
  const authSource = fs.readFileSync(authPath, 'utf8');
  const oldComment = '// Producer Fiscal & Shipping Registration Fields (Pan-European VAT / Tax ID)';
  const matchCount = authSource.split(oldComment).length - 1;
  if (matchCount !== 1) {
    throw new Error(`producer claim field comment: expected 1 match, found ${matchCount}. Refusing to patch.`);
  }

  fs.writeFileSync(
    authPath,
    authSource.replace(
      oldComment,
      '// Producer business evidence fields (optional VAT / Tax ID)'
    )
  );

  try {
    await import('./phase7_patch_producer_trust_fixed');
  } catch (error) {
    restoreBackups();
    throw error;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
