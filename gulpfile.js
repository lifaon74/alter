const gulp = require('gulp');
const gulpPlugins = require('gulp-load-plugins')();
const $path = require('path');
const gutil = require('gulp-util');
const $resolve = require('rollup-plugin-node-resolve');
const $rollup  = require('gulp-better-rollup');

// const $sass = require('gulp-sass');

// console.log(gulpPlugins);

// const tsProjects = {
//   'esnext': gulpPlugins.typescript.createProject('tsconfig.json', {
//     module: 'commonjs',
//     // module: 'es',
//     target: 'esnext',
//   }),
//   'es5': gulpPlugins.typescript.createProject('tsconfig.json', {
//     module: 'amd',
//     target: 'es5',
//   })
// };

const paths = {
  source: './src',
  destination: './dist'
};

paths.ts = [
  $path.join(paths.source, '**', '*.ts'),
  '!' + $path.join(paths.source, '**', 'old', '**', '*.ts'),
  '!' + $path.join(paths.source, '**', '*_*.ts'),
];

paths.scss = [
  $path.join(paths.source, '**', '*.scss')
];

paths.others = [
  $path.join(paths.source, '**'),
  '!' + paths.ts[0],
  '!' + paths.scss[0],
];

paths.package = [
  '.npmignore',
  '.npmrc',
  'package.json',
  'README.md',
  'LICENSE',
];



function compileTs(buildOptions) {
  const tsProject = gulpPlugins.typescript.createProject('tsconfig.json', buildOptions.ts);

  return function _compileTs() {
    return gulp.src(paths.ts, { base: paths.source })
      .pipe(gulpPlugins.cached('tsc'))
      .pipe(gulpPlugins.progeny())
      .pipe(gulpPlugins.debug({ title: 'tsc:' }))
      .pipe(gulpPlugins.sourcemaps.init())
      .pipe(tsProject())
      .on('error', gutil.log)
      .pipe(gulpPlugins.sourcemaps.write())
      .pipe(gulp.dest($path.join(paths.destination)));
  };
}

function compileSCSS(buildOptions) {
  return function _compileTs() {
    return gulp.src(paths.scss, { base: paths.source })
        .pipe(gulpPlugins.cached('scss'))
        .pipe(gulpPlugins.debug({ title: 'scss:' }))
        .pipe(gulpPlugins.sourcemaps.init())
        .pipe(gulpPlugins.sass())
        .on('error', gutil.log)
        .pipe(gulpPlugins.sourcemaps.write())
        .pipe(gulp.dest($path.join(paths.destination)));
  };
}

function copyOtherFiles(buildOptions) {
  return function _copyOtherFiles() {
    return gulp.src(paths.others, { base: paths.source })
      .pipe(gulpPlugins.cached('others'))
      .pipe(gulp.dest($path.join(paths.destination)));
  };
}

function copyPackageFiles() {
  return gulp.src(paths.package)
    .pipe(gulpPlugins.cached('package'))
    .pipe(gulp.dest($path.join(paths.destination)));
}

function bundle(buildOptions) {
  const base = $path.join(paths.destination);
  const outputName = `${$path.basename(buildOptions.rollup.main, $path.extname(buildOptions.rollup.main))}.${buildOptions.rollup.outputPostFix || 'bundled'}.js`;

  return function _bundle() {
    return gulp.src([
      $path.join(paths.destination, buildOptions.rollup.main)
    ], { base: base })
      .pipe(gulpPlugins.sourcemaps.init())
      .pipe($rollup({
        plugins: [
          $resolve({
            mainFields: ['browser', 'module', 'jsnext:main', 'main'],
          }),
          {
            resolveImportMeta(prop, { moduleId }) {
              const path = $path.relative($path.resolve(process.cwd(), paths.destination), moduleId);
              const url = `new URL(${JSON.stringify(path)}, window.origin).href`;
              if (prop === 'url') {
                return url;
              }

              // also handle just `import.meta`
              if (prop === null) {
                return `Object.assign({}, import.meta, { url: ${url} })`;
              }

              // use the default behaviour for all other props
              return null;
            }
          }
        ]
      }, {
        format: buildOptions.rollup.format || 'es',
        name: buildOptions.rollup.name,
        file: outputName
      }))
      // .pipe(gulpPlugins.rename(outputName))
      .pipe(gulpPlugins.sourcemaps.write())
      .pipe(gulp.dest($path.join(paths.destination, 'bundle')));
  };

  // return function _bundle() {
  //   return gulp.src([
  //     $path.join(base, '**', '*.js'),
  //   ], { base: base })
  //     .pipe(gulpPlugins.rollup({
  //       input: $path.join(paths.destination, buildOptions.rollup.main),
  //       allowRealFiles: true,
  //       output: {
  //         format: buildOptions.rollup.format || 'es',
  //         name: buildOptions.rollup.name,
  //         file: outputName
  //       },
  //       plugins: [
  //         $resolve({
  //           mainFields: ['jsnext:main', 'browser', 'module', 'main'],
  //         })
  //       ]
  //     }))
  //     .pipe(gulpPlugins.rename(outputName))
  //     .pipe(gulp.dest($path.join(paths.destination, 'bundle')));
  // };
}


function build(buildOptions) {
  return gulp.parallel(compileTs(buildOptions), compileSCSS(buildOptions), copyOtherFiles(buildOptions));
}

function buildAndBundle(buildOptions) {
  return gulp.series(build(buildOptions), bundle(buildOptions));
}

function watch() {
  gulp.watch(paths.source, buildAndBundle(config));
}

function buildProd() {
  return gulp.parallel(
    buildAndBundle({
      ts: {
        module: 'es6',
        target: 'esnext',
        declaration: true,
      },
      rollup: {
        main: 'app.js',
        format: 'umd',
        name: 'Alter',
        outputPostFix: 'umd.esnext'
      }
    }),
    copyPackageFiles
  );
}

const configs = {
  'esnext browser': {
    ts: {
      module: 'es6',
      target: 'esnext',
    },
    rollup: {
      main: 'app.js',
      format: 'es',
    }
  }
};

const config = configs['esnext browser'];


gulp.task('build', build(config));
gulp.task('bundle', bundle(config));
gulp.task('watch', watch);

gulp.task('build.prod', buildProd());

