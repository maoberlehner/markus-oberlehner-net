const autoprefixer = require(`gulp-autoprefixer`);
const cleancss = require(`gulp-cleancss`);
const del = require(`del`);
const gulp = require(`gulp`);
const nodeSassMagicImporter = require(`node-sass-magic-importer`);
const rename = require(`gulp-rename`);
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

gulp.task(`minify:styles`, () =>
  gulp.src(`app/css/**/*.css`)
    .pipe(rename((originalPath) => {
      // eslint-disable-next-line no-param-reassign
      originalPath.basename += `.min`;
    }))
    .pipe(cleancss())
    .pipe(gulp.dest(stylesDestDirectory))
);

gulp.task(`clean:styles`, () => del(stylesDestDirectory));

gulp.task(`default`, [`watch`]);
