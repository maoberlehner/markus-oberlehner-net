module.exports = class LayoutsPost {
  data() {
    return {
      layout: `base.11ty.js`,
    };
  }

  render({ content, title }) {
    return `<article>
  <h1>${title}</h1>
  ${content}
</article>`;
  }
};
