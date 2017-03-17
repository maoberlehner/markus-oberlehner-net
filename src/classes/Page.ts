import Article from './Article';

interface PageInterface {
  css: string;
  title: string;
  description: string;
  articles: Array<Article>;
}

export default class Page implements PageInterface {
  css: string;
  title: string;
  description: string;
  articles: Array<Article>;
}
