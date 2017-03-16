const path = require(`path`);

const env = process.env.NODE_ENV;
let distDirectory = env === `production` ? `prod` : `dev`;
distDirectory = path.resolve(__dirname, `../dist/${distDirectory}`);
const blogDirectory = path.resolve(distDirectory, `blog`);
const minify = env === `production`;

module.exports = {
  env,
  distDirectory,
  blogDirectory,
  minify,
};
