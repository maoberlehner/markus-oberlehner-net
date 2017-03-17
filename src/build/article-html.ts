import * as fs from 'fs';
import * as highlightJs from 'highlight.js';
import * as marked from 'marked';
import * as path from 'path';

import hbs2html from '../lib/hbs2html';

marked.setOptions({
  highlight: (code, language) => {
    if (language) {
      return highlightJs.highlight(language, code).value;
    }
    return highlightJs.highlightAuto(code).value;
  },
});

const hbs: string = path.join(process.cwd(), `resources`, `views`, `templates`, `article.hbs`);
const template: string = fs.readFileSync(hbs, `utf8`);

export default function articleHtml({ blogDirectory, minify }, article, data): void {
  const outputFile: string = path.join(
    blogDirectory,
    data.date.year,
    data.date.month,
    data.slug,
    `index.html`
  );

  // eslint-disable-next-line no-param-reassign
  data.content = marked(data.markdown)
    .replace(new RegExp(`<pre>`, `g`), `<pre class="c-highlight">\n`)
    .replace(new RegExp(`class="hljs-`, `g`), `class="c-highlight__`)
    .replace(new RegExp(`(<p>)?XDIVclass=(.*?)X(</p>)?`, `g`), `<div class="$2">`)
    .replace(new RegExp(`/XDIVX`, `g`), `</div>`)
    .replace(new RegExp(`<p><div`, `g`), `<div`)
    .replace(new RegExp(`</div></p>`, `g`), `</div>`)
    // Add the article date.
    .replace(new RegExp(`</h1>`), `</h1><span class="c-content__date">${data.date.string}</span>`)
    // Style links and make them SEO friendly.
    .replace(new RegExp(`<a`, `g`), `<a class="c-anchor" rel="nofollow"`);

  // eslint-disable-next-line no-param-reassign
  data.metaTitle = `${data.title} | Markus Oberlehner`;
  // eslint-disable-next-line no-param-reassign
  data.metaDescription = data.description;

  hbs2html(template, data, outputFile, minify);
}
