const makeTerser = require('./make-terser');

makeTerser('dist/global/{{lib-name}}.esnext.umd.js', {
  compress: {
    inline: false
  },
});
