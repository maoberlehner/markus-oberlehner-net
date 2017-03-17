import * as fs from 'fs';
import * as mkdir from 'mkdirp';
import * as path from 'path';

export default function writeFile(file, contents) {
  try {
    mkdir.sync(path.parse(file).dir);
    fs.writeFileSync(file, contents);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
}
