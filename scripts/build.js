const glob = require(`glob`);

const buildArticleHtml = require(`./build/article-html.js`);
const buildBaseCss = require(`./build/base-css.js`);
const buildBaseHtml = require(`./build/base-html.js`);

const articles = glob.sync(`resources/articles/*.md`);

const defaultData = {
  css: `<link rel="stylesheet" href="/base/css/global.css">`,
};

buildBaseHtml(defaultData);
buildBaseCss();

articles.forEach((fileName) => {
  const data = JSON.parse(JSON.stringify(defaultData));

  buildArticleHtml(fileName, data);
});
