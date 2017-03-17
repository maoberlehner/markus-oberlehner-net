import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

import hbs2html from '../lib/hbs2html';

const distEnvPath = process.env.NODE_ENV === `production` ? `prod` : `dev`;
const minify = process.env.NODE_ENV === `production`;

export default function baseHtml(data) {
  const pagesDirectory = path.join(process.cwd(), `resources`, `views`, `pages`);
  const pages = glob.sync(path.join(pagesDirectory, `**`, `*.hbs`));

  pages.forEach((page) => {
    const baseTemplate = fs.readFileSync(page, `utf8`);
    const pathName = path.parse(page).name;
    const subPath = path
      .parse(page.replace(path.join(pagesDirectory, path.sep), ``))
      .dir.split(path.sep);
    const outputPath = [process.cwd(), `dist`, distEnvPath, ...subPath];

    if (pathName !== `index`) {
      outputPath.push(pathName);
    }

    const outputFile = path.join(...outputPath, `index.html`);
    hbs2html(baseTemplate, data, outputFile, minify);
  });
}
