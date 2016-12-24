const buildBaseCss = require(`./build/base-css.js`);
const buildBaseHtml = require(`./build/base-html.js`);
// const getDirectories = require(`./lib/get-directories.js`);

const defaultData = {
  css: `<link rel="stylesheet" href="/base/css/global.css">`,
};

buildBaseHtml(defaultData);
buildBaseCss();
