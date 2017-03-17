import * as CleanCss from 'clean-css';
import * as Handlebars from 'handlebars';
import * as htmlclean from 'htmlclean';
import * as path from 'path';
import * as uncss from 'uncss';

import Page from '../classes/Page';

import fixPreIndentation from './fix-pre-indentation';
import handlebarsRegisterPartials from './handlebars-register-partials';
import writeFile from './write-file';

const distEnvPath: string = process.env.NODE_ENV === `production` ? `prod` : `dev`;
const viewsDirectory: string = path.join(process.cwd(), `resources`, `views`);
handlebarsRegisterPartials(Handlebars, viewsDirectory);

export default function hbs2html(
  template: string,
  data: Page,
  outputFile: string,
  minify: boolean = false
): Promise<any> {
  return new Promise((resolve: Function) => {
    let html: string = htmlclean(Handlebars.compile(template)(data));

    if (minify) {
      uncss(html, { htmlroot: path.join(`dist`, distEnvPath) }, (error, output) => {
        const minifiedCss: string = new CleanCss({
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
  });
}
