import * as path from 'path';

import sass2css from '../lib/sass2css';

const distEnvPath: string = process.env.NODE_ENV === `production` ? `prod` : `dev`;

export default function baseCss(): void {
  const inputFile: string = path.join(process.cwd(), `resources`, `scss`, `global.scss`);
  const outputFile: string = path.join(process.cwd(), `dist`, distEnvPath, `base`, `css`, `global.css`);

  sass2css(inputFile, outputFile);
}
