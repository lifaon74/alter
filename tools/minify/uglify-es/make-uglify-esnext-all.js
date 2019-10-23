const makeUglify = require('./make-uglify');

makeUglify('dist/global/alter.esnext.umd.js', {
  compress: {
    inline: false
  },
});
