import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const distAssets = path.resolve(process.cwd(), 'dist', 'assets');
if (!fs.existsSync(distAssets)) {
  console.error('[Build budget] dist/assets is missing. Run the build first.');
  process.exit(1);
}

const files = fs
  .readdirSync(distAssets)
  .filter((name) => /\.(js|css)$/.test(name))
  .map((name) => {
    const bytes = fs.readFileSync(path.join(distAssets, name));
    return {
      name,
      raw: bytes.byteLength,
      gzip: gzipSync(bytes).byteLength,
      kind: name.endsWith('.css') ? 'css' : 'js',
    };
  });

const js = files.filter((file) => file.kind === 'js');
const css = files.filter((file) => file.kind === 'css');
const main = js.find((file) => /^index-.*\.js$/.test(file.name));
const totalJsGzip = js.reduce((sum, file) => sum + file.gzip, 0);
const totalCssGzip = css.reduce((sum, file) => sum + file.gzip, 0);
const largestJs = [...js].sort((a, b) => b.gzip - a.gzip)[0];

const KB = 1024;
const budgets = {
  mainJsGzip: 330 * KB,
  largestJsGzip: 330 * KB,
  totalJsGzip: 800 * KB,
  totalCssGzip: 32 * KB,
};

const failures: string[] = [];
if (!main) failures.push('Main index JS chunk was not found.');
if (main && main.gzip > budgets.mainJsGzip) {
  failures.push(
    `Main JS gzip ${(main.gzip / KB).toFixed(1)} KB exceeds ${budgets.mainJsGzip / KB} KB.`
  );
}
if (largestJs && largestJs.gzip > budgets.largestJsGzip) {
  failures.push(
    `Largest JS chunk ${largestJs.name} is ${(largestJs.gzip / KB).toFixed(1)} KB gzip; limit is ${budgets.largestJsGzip / KB} KB.`
  );
}
if (totalJsGzip > budgets.totalJsGzip) {
  failures.push(
    `Total JS gzip ${(totalJsGzip / KB).toFixed(1)} KB exceeds ${budgets.totalJsGzip / KB} KB.`
  );
}
if (totalCssGzip > budgets.totalCssGzip) {
  failures.push(
    `Total CSS gzip ${(totalCssGzip / KB).toFixed(1)} KB exceeds ${budgets.totalCssGzip / KB} KB.`
  );
}

console.log('[Build budget]');
console.log(
  `  main JS: ${main ? (main.gzip / KB).toFixed(1) : 'missing'} KB gzip`
);
console.log(
  `  largest JS: ${largestJs ? `${largestJs.name} ${(largestJs.gzip / KB).toFixed(1)} KB` : 'missing'} gzip`
);
console.log(`  total JS: ${(totalJsGzip / KB).toFixed(1)} KB gzip`);
console.log(`  total CSS: ${(totalCssGzip / KB).toFixed(1)} KB gzip`);

if (failures.length) {
  for (const failure of failures) console.error(`[Build budget failed] ${failure}`);
  process.exit(1);
}
