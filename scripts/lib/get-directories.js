const fs = require(`fs`);
const path = require(`path`);

module.exports = srcpath =>
  fs.readdirSync(srcpath).filter(file =>
    fs.statSync(path.join(srcpath, file)).isDirectory()
  );
