const fs = require(`fs`);
const highlightJs = require(`highlight.js`);
const marked = require(`marked`);
const path = require(`path`);

const hbs2html = require(`../lib/hbs2html.js`);

marked.setOptions({
  highlight: (code, language) => {
    if (language) {
      return highlightJs.highlight(language, code).value;
    }
    return highlightJs.highlightAuto(code).value;
  },
});

const hbs = path.join(process.cwd(), `resources`, `views`, `templates`, `article.hbs`);
const template = fs.readFileSync(hbs, `utf8`);
const blogDirectory = path.join(process.cwd(), `dist`, `blog`);

module.exports = (article, data) => {
  const outputFile = path.join(
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

  hbs2html(template, data, outputFile);
};
