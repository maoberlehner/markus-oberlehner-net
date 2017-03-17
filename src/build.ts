import * as glob from 'glob';

import config from './config';

import Article from './classes/Article';
import Page from './classes/Page';

import buildArticleHtml from './build/article-html';
import buildBaseCss from './build/base-css';
import buildBaseHtml from './build/base-html';
import extractArticleData from './lib/extract-article-data';

const articleFiles: Array<string> = glob.sync(`resources/articles/*.md`).reverse();

const defaultData: Page = {
  css: `<link rel="stylesheet" href="/base/css/global.css">`,
  title: ``,
  description: ``,
  articles: [],
};

articleFiles.forEach((fileName) => {
  const articleData: Article = Object.assign({}, defaultData, extractArticleData(fileName));
  defaultData.articles.push(articleData);

  buildArticleHtml(config, fileName, articleData);
});

buildBaseHtml(defaultData);
buildBaseCss();
