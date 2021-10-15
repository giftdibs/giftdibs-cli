const cli = require('./cli');

try {
  cli({
    cliArgs: process.argv.slice(2),
  });
} catch (err) {
  console.error('[gd error]', err);
}
