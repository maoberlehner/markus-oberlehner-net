const fs = require(`fs`);
const path = require(`path`);

module.exports = (article) => {
  const dateArray = path.parse(article).base.split(`_`)[0].split(`-`);
  const date = {
    year: dateArray[0],
    month: dateArray[1],
    day: dateArray[2],
  };
  const slug = path.parse(article).base.split(`_`)[1].replace(`.md`, ``);
  let markdown = fs.readFileSync(article, `utf8`);
  const jsonRegex = /^{[\s\S]*?}/i;
  const extractedData = JSON.parse(markdown.match(jsonRegex)[0]);
  markdown = markdown.replace(/^{[\s\S]*?}/i, ``);

  return Object.assign({
    date,
    slug,
    markdown,
  }, extractedData);
};
