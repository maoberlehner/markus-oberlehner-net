const autoprefixer = require(`gulp-autoprefixer`);
const CleanCSS = require(`clean-css`);
const declassify = require(`declassify`);
const gulp = require(`gulp`);
const htmlmin = require(`gulp-htmlmin`);
const inline = require(`gulp-inline-source`);
const nodeSassMagicImporter = require(`node-sass-magic-importer`);
const path = require(`path`);
const rimraf = require(`rimraf`);
const sass = require(`gulp-sass`);
const sourcemaps = require(`gulp-sourcemaps`);
const transform = require(`gulp-transform`);
const uncss = require(`uncss`);

const themeSrcDirectory = `themes/mao/src`;
const publicDirectory = `public`;
const stylesDestDirectory = `static/dist/css`;
const scssRoot = `scss`;
const scssPath = path.join(themeSrcDirectory, scssRoot, `**/*.scss`);
const htmlPath = path.join(publicDirectory, `**/*.html`);

gulp.task(`watch`, () => {
  gulp.watch(scssPath, [`styles`]);
});

gulp.task(`styles`, [`clean:styles`], () =>
  gulp.src(scssPath)
    .pipe(sourcemaps.init())
    .pipe(sass({
      importer: nodeSassMagicImporter(),
    }).on(`error`, sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write({ sourceRoot: path.join(`/`, scssRoot) }))
    .pipe(gulp.dest(stylesDestDirectory))
);

gulp.task(`minify:markup`, () =>
  gulp.src(htmlPath)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(inline({
      rootpath: path.join(publicDirectory, `/`),
      handlers: (source, context, next) => {
        if (source.type === `css` && source.fileContent && !source.content) {
          uncss(context.html, { htmlroot: publicDirectory }, (error, css) => {
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
    .pipe(transform(`utf8`, content => declassify.process(content)))
    .pipe(gulp.dest(publicDirectory))
);

gulp.task(`clean:styles`, () => rimraf.sync(stylesDestDirectory));

gulp.task(`build`, [`styles`, `minify:markup`]);

gulp.task(`default`, [`watch`, `build`]);
