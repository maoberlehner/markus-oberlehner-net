import * as fs from 'fs';
import * as moment from 'moment';
import * as path from 'path';
import * as yaml from 'js-yaml';

import Article from '../classes/Article';

export default function extractArticleData(fileName: string): Article {
  const dateString: string = path.parse(fileName).base.split(`_`)[0];
  const dateArray: Array<string> = dateString.split(`-`);
  const date = {
    year: dateArray[0],
    month: dateArray[1],
    day: dateArray[2],
    string: moment(dateString).format(`MMMM D, YYYY`),
  };
  const slug: string = path.parse(fileName).base.split(`_`)[1].replace(`.md`, ``);
  const url: string = `/blog/${date.year}/${date.month}/${slug}/`;
  let markdown: string = fs.readFileSync(fileName, `utf8`);
  const yamlRegex: RegExp = /^---([\s\S]*?)---/i;
  const extractedData: Article = yaml.safeLoad(markdown.match(yamlRegex)[1]);
  markdown = markdown.replace(/^---[\s\S]*?---/i, ``);

  return Object.assign({
    date,
    slug,
    url,
    markdown,
  }, extractedData);
}
