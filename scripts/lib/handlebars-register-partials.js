const glob = require(`glob`);
const fs = require(`fs`);
const path = require(`path`);

module.exports = (Handlebars, viewsDirectory) => {
  const views = glob.sync(path.join(viewsDirectory, `**`, `*.hbs`));

  views.forEach((view) => {
    const partialName = view.replace(`${viewsDirectory}/`, ``).replace(`.hbs`, ``);
    Handlebars.registerPartial(partialName, fs.readFileSync(view, `utf8`));
  });
};
