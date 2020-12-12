module.exports = class LayoutsBase {
  render({
    content,
    description,
    meta,
    title,
  }) {
    return `
      <!doctype html>
      <html lang="${meta.lang}">
        <head>
          <meta charset="utf-8">
          <title>${title || meta.title}</title>
          <meta name="description" content="${description || meta.description}">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body>
          <div role="document">
            <main id="main" tabindex="-1">
              ${content}
            </main>
          </div>
        </body>
      </html>
    `;
  }
};
