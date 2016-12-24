const autoprefixer = require(`autoprefixer`);
const magicImporter = require(`node-sass-magic-importer`);
const postcss = require(`postcss`);
const postcssScssSyntax = require(`postcss-scss`);
const sass = require(`node-sass`);

const writeFile = require(`./write-file.js`);

module.exports = (inputFile, outputFile, options = { cwd: process.cwd() }) => {
  sass.render({
    file: inputFile,
    importer: magicImporter(options),
  }, (error, result) => {
    if (error) throw error;

    let css = result.css.toString();
    css = postcss(autoprefixer).process(css, { syntax: postcssScssSyntax }).css;

    writeFile(outputFile, css);
  });
};
