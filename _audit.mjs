// Final audit: confirm everything loads, nothing is broken, and report weight.
export default async function run(page, ui) {
  // --- asset weight ---
  const files = [
    "/", "/css/styles.css", "/js/main.js", "/assets/logo.png",
    "/assets/photos/workshop.jpg", "/assets/photos/session.jpg",
    "/assets/photos/graduates.jpg", "/assets/photos/focused.jpg",
    "/assets/people/p1.svg", "/assets/people/p6.svg"
  ];
  const weights = [];
  let total = 0;
  for (const f of files) {
    const r = await page.request.get(new URL(f, page.url()).href);
    const body = await r.body();
    total += body.length;
    weights.push({ file: f, kb: Math.round(body.length / 1024), status: r.status() });
  }

  // --- full render + lazy load ---
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(page.url(), { waitUntil: "load" });
  await page.waitForTimeout(900);
  const h = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < h; y += 700) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(140);
  }
  await page.waitForTimeout(900);

  const dom = await page.evaluate(() => {
    const imgs = [...document.images];
    return {
      images: imgs.length,
      broken: imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.getAttribute("src")),
      missingAlt: imgs.filter((i) => !i.hasAttribute("alt")).length,
      photos: document.querySelectorAll(".hero-collage img, .photo-band img, .why-photo img").length,
      portraits: document.querySelectorAll(".avatar, .mini-avatar").length,
      credits: !!document.querySelector(".footer-credits"),
      hiddenReveals: [...document.querySelectorAll(".reveal")].filter((e) => getComputedStyle(e).opacity === "0").length,
      overflows: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    };
  });

  return { weights, totalKB: Math.round(total / 1024), dom };
}
