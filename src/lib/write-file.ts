const fs = require(`fs`);
const mkdir = require(`mkdirp`);
const path = require(`path`);

module.exports = (file, contents) => {
  try {
    mkdir.sync(path.parse(file).dir);
    fs.writeFileSync(file, contents);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
  }
};
