const markdownIt = require(`markdown-it`);

const filters = require(`./utils/filters.js`);

module.exports = (config) => {
  Object.keys(filters).forEach((filterName) => {
    config.addFilter(filterName, filters[filterName]);
  });

  config.addWatchTarget(`./src/assets`);

  config.setLibrary(
    `md`,
    markdownIt({
      html: true,
      breaks: true,
      linkify: true,
      typographer: true,
    }),
  );

  config.addPassthroughCopy(`src/site.webmanifest`);
  config.addPassthroughCopy(`src/assets/images`);

  return {
    dir: {
      input: `src`,
      output: `dist`,
      includes: `includes`,
      layouts: `layouts`,
      data: `data`,
    },
    templateFormats: [`md`, `11ty.js`],
    htmlTemplateEngine: `njk`,
    markdownTemplateEngine: `njk`,
  };
};
