// analyze.cjs
const { PurgeCSS } = require('purgecss');
const { purgecssConfig } = require('./purgecss.config.cjs');

PurgeCSS.purgeCSSWithOptions =  new PurgeCSS().purge(purgecssConfig).then(results => {
  results.forEach(result => {
    console.log(`\n--- ${result.file} ---`);
    console.log('Rejected selectors:', result.rejected);
  });
});
