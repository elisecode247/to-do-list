// analyze.cjs
const { PurgeCSS } = require('purgecss');
const { purgecssConfig } = require('./purgecss.config.cjs');

PurgeCSS.purgeCSSWithOptions =  new PurgeCSS().purge(purgecssConfig).then(results => {
  results.forEach(result => {
    console.info(`\n--- ${result.file} ---`);
    console.info('Rejected selectors:', result.rejected);
  });
});
