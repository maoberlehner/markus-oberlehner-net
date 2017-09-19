import { Selector } from 'testcafe';

fixture(`Blog`).page(`http://localhost:1337/blog/`);

test(`less than 11 articles are shown`, async (t) => {
  const articleCount = await Selector(`.qa-article-list-item`).count;

  await t.expect(articleCount < 11).ok();
});

test(`page 1 is indexable`, async (t) => {
  const description = await Selector(`[name="robots"]`).getAttribute(`content`);

  await t.expect(description === `index,follow`).ok();
});

test(`page 2 is not indexable`, async (t) => {
  await t.click(`.qa-pagination-next`);

  const description = await Selector(`[name="robots"]`).getAttribute(`content`);

  await t.expect(description === `noindex,follow`).ok();
});

test(`blog article contains important header data`, async (t) => {
  await t.click(`.qa-article-list-cta`);

  const title = await Selector(`title`).innerText;
  const description = await Selector(`[name="description"]`).getAttribute(`content`);
  const author = await Selector(`[name="author"]`).exists;
  const themeColor = await Selector(`[name="theme-color"]`).exists;
  const robots = await Selector(`[name="robots"]`).exists;
  const canonical = await Selector(`[rel="canonical"]`).exists;
  const manifest = await Selector(`[rel="manifest"]`).exists;

  await t
    .expect(title.length > 10)
    .ok()
    .expect(description.length > 70)
    .ok()
    .expect(author)
    .ok()
    .expect(themeColor)
    .ok()
    .expect(robots)
    .ok()
    .expect(canonical)
    .ok()
    .expect(manifest)
    .ok();
});
