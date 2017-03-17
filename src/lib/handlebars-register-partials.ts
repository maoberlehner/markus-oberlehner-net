import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';

export default function handlebarsRegisterPartials(Handlebars, viewsDirectory): void {
  const views: Array<string> = glob.sync(path.join(viewsDirectory, `**`, `*.hbs`));

  views.forEach((view) => {
    const partialName: string = view.replace(`${viewsDirectory}/`, ``).replace(`.hbs`, ``);
    Handlebars.registerPartial(partialName, fs.readFileSync(view, `utf8`));
  });
}
