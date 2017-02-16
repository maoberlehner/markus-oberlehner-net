module.exports = (html) => {
  const pattern = html.match(/\s*\n\s*/);
  return html.replace(new RegExp(pattern, `g`), `\n`);
};
