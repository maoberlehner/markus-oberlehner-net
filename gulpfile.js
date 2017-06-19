const autoprefixer = require(`gulp-autoprefixer`);
const CleanCSS = require(`clean-css`);
const gulp = require(`gulp`);
const htmlmin = require(`gulp-htmlmin`);
const inline = require(`gulp-inline-source`);
const uncss = require(`uncss`);
const nodeSassMagicImporter = require(`node-sass-magic-importer`);
const rimraf = require(`rimraf`);
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
      rootpath: `public/`,
      handlers: (source, context, next) => {
        if (source.type === `css` && source.fileContent && !source.content) {
          uncss(context.html, { htmlroot: `public` }, (error, css) => {
            if (error) throw error;
            // eslint-disable-next-line no-param-reassign
            source.content = `<style>${new CleanCSS({ level: 2 }).minify(css).styles}</style>`;
            next();
          });
        } else {
          next();
        }
      },
    }))
    .pipe(gulp.dest(`public`))
);

gulp.task(`clean:styles`, () => rimraf.sync(stylesDestDirectory));

gulp.task(`build`, [`styles`, `minify:markup`]);

gulp.task(`default`, [`watch`, `build`]);
