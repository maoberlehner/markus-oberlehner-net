import * as path from 'path';

const env: string = process.env.NODE_ENV;
let distDirectory: string = env === `production` ? `prod` : `dev`;
distDirectory = path.resolve(__dirname, `../dist/${distDirectory}`);
const blogDirectory: string = path.resolve(distDirectory, `blog`);
const minify: boolean = env === `production`;

export default {
  env,
  distDirectory,
  blogDirectory,
  minify,
};
