const CleanCss = require(`clean-css`);
const Handlebars = require(`handlebars`);
const htmlclean = require(`htmlclean`);
const path = require(`path`);
const uncss = require(`uncss`);

const fixPreIndentation = require(`./fix-pre-indentation.js`);
const handlebarsRegisterPartials = require(`./handlebars-register-partials.js`);
const writeFile = require(`./write-file.js`);

const viewsDirectory = path.join(process.cwd(), `resources`, `views`);
handlebarsRegisterPartials(Handlebars, viewsDirectory);

module.exports = (template, data, outputFile) => {
  let html = htmlclean(Handlebars.compile(template)(data));
  const minify = process.argv.includes(`--minify`);

  if (minify) {
    uncss(html, { htmlroot: `dist` }, (error, output) => {
      const minifiedCss = new CleanCss({
        level: 2,
      }).minify(output).styles;
      // eslint-disable-next-line no-param-reassign
      data.css = `<style>${minifiedCss}</style>`;
      html = htmlclean(Handlebars.compile(template)(data));

      writeFile(outputFile, fixPreIndentation(html));
    });
  } else {
    writeFile(outputFile, fixPreIndentation(html));
  }
};
