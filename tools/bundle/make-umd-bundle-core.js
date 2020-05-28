const rollupBundle = require('./rollup-bundle');

rollupBundle({
  input: 'dist/esm5_for_rollup/core/public.js',
  dest: 'dist/global/{{lib-name}}.core.umd.js',
});
