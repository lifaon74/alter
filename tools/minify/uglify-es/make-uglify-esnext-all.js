const makeUglify = require('./make-uglify');

makeUglify('dist/global/{{lib-name}}.esnext.umd.js', {
  compress: {
    inline: false
  },
});
