import ArticleDate from './ArticleDate';
import Page from './Page';

interface ArticleInterface extends Page {
  date: ArticleDate;
  intro: string;
  markdown: string;
}

export default class Article implements ArticleInterface {
  css: string;
  title: string;
  description: string;
  date: ArticleDate;
  intro: string;
  markdown: string;
  articles: Array<Article>;
}
