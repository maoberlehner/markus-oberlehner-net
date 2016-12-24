const path = require(`path`);

const sass2css = require(`../lib/sass2css.js`);

module.exports = () => {
  const inputFile = path.join(process.cwd(), `resources`, `scss`, `global.scss`);
  const outputFile = path.join(process.cwd(), `dist`, `base`, `css`, `global.css`);

  sass2css(inputFile, outputFile);
};
