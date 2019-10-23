const makeUglify = require('./make-uglify');

makeUglify('dist/global/alter2.esnext.umd.js', {
  compress: {
    inline: false
  },
});
