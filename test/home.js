import { Selector } from 'testcafe';

fixture(`Home`).page(`http://localhost:1337/`);

test(`The page contains all important header data.`, async (t) => {
  const title = await Selector(`title`).innerText;
  const description = await Selector(`[name="description"]`).getAttribute(`content`);
  const author = await Selector(`[name="author"]`).exists;
  const themeColor = await Selector(`[name="theme-color"]`).exists;
  const robots = await Selector(`[name="robots"]`).exists;
  const canonical = await Selector(`[rel="canonical"]`).exists;
  const manifest = await Selector(`[rel="manifest"]`).exists;

  await t
    .expect(title.length > 20)
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

test(`The latest 3 articles are shown.`, async (t) => {
  const articleCount = await Selector(`.qa-article-list-item`).count;

  await t.expect(articleCount === 3).ok();
});
