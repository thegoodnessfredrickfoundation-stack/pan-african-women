// Verify the smaller logos render and report final page weight.
export default async function run(page, ui) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(page.url(), { waitUntil: "load" });
  await page.waitForTimeout(900);
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(130);
  }
  await page.waitForTimeout(700);

  const dom = await page.evaluate(() => {
    const imgs = [...document.images];
    return {
      images: imgs.length,
      broken: imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute("src")),
      missingAlt: imgs.filter((i) => !i.hasAttribute("alt")).length,
      logoInHeader: !!document.querySelector(".brand-logo"),
      logoInFooter: !!document.querySelector(".f-brand img"),
      overflows: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    };
  });

  const files = [
    "/", "/css/styles.css", "/js/main.js",
    "/assets/logo-96.png", "/assets/logo-160.png",
    "/assets/photos/workshop.jpg", "/assets/photos/session.jpg",
    "/assets/photos/graduates.jpg", "/assets/photos/focused.jpg",
    "/assets/people/p1.svg", "/assets/people/p2.svg", "/assets/people/p3.svg",
    "/assets/people/p4.svg", "/assets/people/p5.svg", "/assets/people/p6.svg"
  ];
  let total = 0;
  const heavy = [];
  for (const f of files) {
    const r = await page.request.get(new URL(f, page.url()).href);
    const b = await r.body();
    total += b.length;
    if (b.length > 100 * 1024) heavy.push({ f, kb: Math.round(b.length / 1024) });
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: "final.png" });

  return { dom, totalKB: Math.round(total / 1024), over100kb: heavy };
}
