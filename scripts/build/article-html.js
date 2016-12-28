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

const hbs = path.join(process.cwd(), `resources`, `views`, `pages`, `article.hbs`);
const template = fs.readFileSync(hbs, `utf8`);
const blogDirectory = path.join(process.cwd(), `dist`, `blog`);

module.exports = (article, data) => {
  const date = path.parse(article).base.split(`_`)[0];
  const year = date.split(`-`)[0];
  const month = date.split(`-`)[1];
  const slug = path.parse(article).base.split(`_`)[1].replace(`.md`, ``);
  data.metaTitle = `${slug} | Markus Oberlehner`;
  const outputFile = path.join(blogDirectory, year, month, slug, `index.html`);
  const content = fs.readFileSync(article, `utf8`);

  // Create live demo code from code example.
  const matchExamples = new RegExp(`\`\`\`html((.|\n)*?)\`\`\``, `g`);
  // eslint-disable-next-line no-param-reassign
  data.content = marked(content.replace(
    matchExamples,
    `XDIVclass=c-demoX\r\nXDIVclass=c-demo__viewX\r\n$1/XDIVX\r\n\`\`\`html$1\`\`\`\r\n/XDIVX`
  ))
  .replace(new RegExp(`<pre>`, `g`), `<pre class="c-highlight">`)
  .replace(new RegExp(`class="hljs-`, `g`), `class="c-highlight__`)
  .replace(new RegExp(`(<p>)?XDIVclass=(.*?)X(</p>)?`, `g`), `<div class="$2">`)
  .replace(new RegExp(`/XDIVX`, `g`), `</div>`)
  .replace(new RegExp(`<p><div`, `g`), `<div`)
  .replace(new RegExp(`</div></p>`, `g`), `</div>`)
  // Style links and make them SEO friendly.
  .replace(new RegExp(`<a`, `g`), `<a class="c-anchor" rel="nofollow"`);

  // eslint-disable-next-line no-param-reassign
  data.metaDescription = data.content.match(/<p>(.*?)<\/p>/)[1];

  hbs2html(template, data, outputFile);
};
