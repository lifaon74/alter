const rollupBundle = require('./rollup-bundle');

rollupBundle({
  input: 'dist/esnext_for_rollup/core/public.js',
  dest: 'dist/global/alter.esnext.core.umd.js',
});
