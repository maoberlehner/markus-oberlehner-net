const autoprefixer = require(`gulp-autoprefixer`);
const cleancss = require(`gulp-cleancss`);
const rimraf = require(`rimraf`);
const gulp = require(`gulp`);
const htmlmin = require(`gulp-htmlmin`);
const inline = require(`gulp-inline`);
const nodeSassMagicImporter = require(`node-sass-magic-importer`);
const sass = require(`gulp-sass`);
const sourcemaps = require(`gulp-sourcemaps`);

const stylesDestDirectory = `static/dist/css`;

gulp.task(`watch`, () => {
  gulp.watch(`themes/mao/src/scss/**/*.scss`, [`styles`]);
});

gulp.task(`styles`, [`clean:styles`], () =>
  gulp.src(`themes/mao/src/scss/**/*.scss`)
    .pipe(sourcemaps.init())
      .pipe(sass({
        importer: nodeSassMagicImporter(),
      }).on(`error`, sass.logError))
      .pipe(autoprefixer())
    .pipe(sourcemaps.write({ sourceRoot: `/scss` }))
    .pipe(gulp.dest(stylesDestDirectory))
);

gulp.task(`minify:markup`, () =>
  gulp.src(`public/**/*.html`)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(inline({
      base: `public/`,
      css: [cleancss],
      disabledTypes: [`img`],
    }))
    .pipe(gulp.dest(`public`))
);

gulp.task(`clean:styles`, () => rimraf.sync(stylesDestDirectory));

gulp.task(`build`, [`minify:markup`]);

gulp.task(`default`, [`watch`]);
