module.exports = (html) => {
  const pattern = html.match(/\s*\n[\t\s]*/);
  return html.replace(new RegExp(pattern, `g`), `\n`);
};
