module.exports = class Robots {
  data() {
    return {
      eleventyExcludeFromCollections: true,
      permalink: `/robots.txt`,
    };
  }

  render({ meta }) {
    return `# www.robotstxt.org

User-agent: *
Disallow: /build.txt

Sitemap: ${meta.url}/sitemap.xml`;
  }
};
