const glob = require(`glob`);

const buildArticleHtml = require(`./build/article-html.js`);
const buildBaseCss = require(`./build/base-css.js`);
const buildBaseHtml = require(`./build/base-html.js`);
const extractArticleData = require(`./lib/extract-article-data.js`);

const articleFiles = glob.sync(`resources/articles/*.md`).reverse();

const defaultData = {
  css: `<link rel="stylesheet" href="/base/css/global.css">`,
  articles: [],
};

articleFiles.forEach((fileName) => {
  const data = JSON.parse(JSON.stringify(defaultData));
  Object.assign(data, extractArticleData(fileName));
  defaultData.articles.push(data);

  buildArticleHtml(fileName, data);
});

buildBaseHtml(defaultData);
buildBaseCss();
