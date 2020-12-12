const nodeSass = require(`node-sass`);
const nodeSassMagicImporter = require(`node-sass-magic-importer`);
const path = require(`path`);

const ENTRY_FILE_NAME = `main.scss`;
const isProd = process.env.ELEVENTY_ENV === `production`;

module.exports = class {
  async data() {
    const entryPath = path.join(__dirname, `/${ENTRY_FILE_NAME}`);

    return {
      eleventyExcludeFromCollections: true,
      entryPath,
      permalink: `/assets/styles/main.css`,
    };
  }

  async compile(config) {
    return new Promise((resolve, reject) => {
      const defaultConfig = {
        importer: nodeSassMagicImporter(),
      };

      if (!isProd) {
        defaultConfig.sourceMap = true;
        defaultConfig.sourceMapEmbed = true;
        defaultConfig.outputStyle = `expanded`;
      }

      return nodeSass.render({
        ...defaultConfig,
        ...config,
      }, (error, result) => {
        if (error) return reject(error);
        return resolve(result.css.toString());
      });
    });
  }

  async render({ entryPath }) {
    return this.compile({ file: entryPath });
  }
};
