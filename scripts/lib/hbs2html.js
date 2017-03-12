const CleanCss = require(`clean-css`);
const Handlebars = require(`handlebars`);
const htmlclean = require(`htmlclean`);
const path = require(`path`);
const uncss = require(`uncss`);

const fixPreIndentation = require(`./fix-pre-indentation.js`);
const handlebarsRegisterPartials = require(`./handlebars-register-partials.js`);
const writeFile = require(`./write-file.js`);

const distEnvPath = process.env.NODE_ENV === `production` ? `prod` : `dev`;
const viewsDirectory = path.join(process.cwd(), `resources`, `views`);
handlebarsRegisterPartials(Handlebars, viewsDirectory);

module.exports = (template, data, outputFile, minify = false) => (
  new Promise((resolve) => {
    let html = htmlclean(Handlebars.compile(template)(data));

    if (minify) {
      uncss(html, { htmlroot: path.join(`dist`, distEnvPath) }, (error, output) => {
        const minifiedCss = new CleanCss({
          level: 2,
        }).minify(output).styles;
        // eslint-disable-next-line no-param-reassign
        data.css = `<style>${minifiedCss}</style>`;
        html = htmlclean(Handlebars.compile(template)(data));

        writeFile(outputFile, fixPreIndentation(html));
        resolve();
      });
    } else {
      writeFile(outputFile, fixPreIndentation(html));
      resolve();
    }
  })
);
