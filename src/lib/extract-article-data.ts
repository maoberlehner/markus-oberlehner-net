import * as fs from 'fs';
import * as moment from 'moment';
import * as path from 'path';
import * as yaml from 'js-yaml';

export default function extractArticleData(article) {
  const dateString = path.parse(article).base.split(`_`)[0];
  const dateArray = dateString.split(`-`);
  const date = {
    year: dateArray[0],
    month: dateArray[1],
    day: dateArray[2],
    string: moment(dateString).format(`MMMM D, YYYY`),
  };
  const slug = path.parse(article).base.split(`_`)[1].replace(`.md`, ``);
  const url = `/blog/${date.year}/${date.month}/${slug}/`;
  let markdown = fs.readFileSync(article, `utf8`);
  const yamlRegex = /^---([\s\S]*?)---/i;
  const extractedData = yaml.safeLoad(markdown.match(yamlRegex)[1]);
  markdown = markdown.replace(/^---[\s\S]*?---/i, ``);

  return Object.assign({
    date,
    slug,
    url,
    markdown,
  }, extractedData);
}
