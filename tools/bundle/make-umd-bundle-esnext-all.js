const rollupBundle = require('./rollup-bundle');

rollupBundle({
  input: 'dist/esnext_for_rollup/public.js',
  dest: 'dist/global/{{lib-name}}.esnext.umd.js',
});
