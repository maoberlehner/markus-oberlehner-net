import * as path from 'path';

import sass2css from '../lib/sass2css';

const distEnvPath = process.env.NODE_ENV === `production` ? `prod` : `dev`;

export default function baseCss() {
  const inputFile = path.join(process.cwd(), `resources`, `scss`, `global.scss`);
  const outputFile = path.join(process.cwd(), `dist`, distEnvPath, `base`, `css`, `global.css`);

  sass2css(inputFile, outputFile);
}
