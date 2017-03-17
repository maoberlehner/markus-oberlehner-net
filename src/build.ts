import * as glob from 'glob';

import config from './config';

import buildArticleHtml from './build/article-html';
import buildBaseCss from './build/base-css';
import buildBaseHtml from './build/base-html';
import extractArticleData from './lib/extract-article-data';

const articleFiles = glob.sync(`resources/articles/*.md`).reverse();

const defaultData = {
  css: `<link rel="stylesheet" href="/base/css/global.css">`,
  articles: [],
};

articleFiles.forEach((fileName) => {
  const articleData = Object.assign({}, defaultData, extractArticleData(fileName));
  defaultData.articles.push(articleData);

  buildArticleHtml(config, fileName, articleData);
});

buildBaseHtml(defaultData);
buildBaseCss();
