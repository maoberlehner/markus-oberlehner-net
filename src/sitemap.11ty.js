module.exports = class Sitemap {
  data() {
    return {
      eleventyExcludeFromCollections: true,
      permalink: `/sitemap.xml`,
    };
  }

  render({ collections, meta }) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${collections.all.filter(item => !item.data.excludeFromSitemap && item.url).map(item => `<url>
    <loc>${[meta.url, item.url].join(``)}</loc>
    <lastmod>${this.dateToFormat(item.date, `yyyy-MM-dd`)}</lastmod>
  </url>`).join(`\n`)}
</urlset>`;
  }
};
