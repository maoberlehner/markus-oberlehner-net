const fs = require(`fs`);
const highlightJs = require(`highlight.js`);
const marked = require(`marked`);
const path = require(`path`);

const extractArticleData = require(`../lib/extract-article-data.js`);
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
  const articleData = extractArticleData(article);

  const outputFile = path.join(
    blogDirectory,
    articleData.date.year,
    articleData.date.month,
    articleData.slug,
    `index.html`
  );

  // Create live demo code from code example.
  const matchExamples = new RegExp(`\`\`\`html((.|\n)*?)\`\`\``, `g`);
  // eslint-disable-next-line no-param-reassign
  data.content = marked(articleData.markdown.replace(
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
  data.metaTitle = `${articleData.title} | Markus Oberlehner`;
  // eslint-disable-next-line no-param-reassign
  data.metaDescription = articleData.description;

  hbs2html(template, data, outputFile);
};
