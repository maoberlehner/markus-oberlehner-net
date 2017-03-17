export default function fixPreIdentation(html: any): string {
  const pattern: Object = html.match(/\s*\n\s*/);
  return html.replace(new RegExp(pattern.toString(), `g`), `\n`);
}
