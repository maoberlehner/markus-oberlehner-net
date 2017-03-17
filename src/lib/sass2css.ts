import * as autoprefixer from 'autoprefixer';
import * as magicImporter from 'node-sass-magic-importer';
import * as postcss from 'postcss';
import * as postcssScssSyntax from 'postcss-scss';
import * as sass from 'node-sass';

import writeFile from './write-file';

export default function sass2css(inputFile, outputFile, options = { cwd: process.cwd() }) {
  sass.render({
    file: inputFile,
    importer: magicImporter(options),
  }, (error, result) => {
    if (error) throw error;

    let css = result.css.toString();
    css = postcss(autoprefixer).process(css, { syntax: postcssScssSyntax }).css;

    writeFile(outputFile, css);
  });
}
