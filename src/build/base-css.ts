const path = require(`path`);

const sass2css = require(`../lib/sass2css.js`);

const distEnvPath = process.env.NODE_ENV === `production` ? `prod` : `dev`;

module.exports = () => {
  const inputFile = path.join(process.cwd(), `resources`, `scss`, `global.scss`);
  const outputFile = path.join(process.cwd(), `dist`, distEnvPath, `base`, `css`, `global.css`);

  sass2css(inputFile, outputFile);
};
