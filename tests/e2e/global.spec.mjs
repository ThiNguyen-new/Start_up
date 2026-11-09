// QA_PLAN mục 1: Toàn site (G1–G8)
import { test, expect, PAGES, brokenImages, isCollapsedNav, addFirstProduct } from './helpers.mjs';

test.describe('G — Toàn site', () => {
  for (const path of PAGES) {
    test(`[G*] /${path} không lỗi console, không 404, không ảnh vỡ`, async ({ page, issues }) => {
      const res = await page.goto(path);
      expect(res?.status(), `/${path} phải trả 200`).toBe(200);
      expect(await brokenImages(page), 'Ảnh hỏng').toEqual([]);
      await issues.expectNone();
    });
  }

  test('[G1] Menu chính mở đúng trang và không còn "Tải Setup"', async ({ page }) => {
    await page.goto('');
    const nav = page.locator('#navigation');
    await expect(nav).not.toContainText('Tải Setup');
    const links = await nav.locator('a.nav-link').evaluateAll((as) => as.map((a) => a.href));
    expect(links.length).toBeGreaterThanOrEqual(7);
    for (const href of links) {
      const r = await page.request.get(href);
      expect(r.status(), href).toBe(200);
    }
  });

  test('[G2] Menu mobile ☰ mở/đóng được', async ({ page }) => {
    test.skip(!isCollapsedNav(page), 'Chỉ áp dụng dưới 992px');
    await page.goto('');
    const nav = page.locator('#navigation');
    await expect(nav).toBeHidden();
    await page.locator('.navbar-toggler').click();
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'FAQ' })).toBeVisible();
    await expect(nav).toHaveClass(/\bshow\b/); // đợi hết hiệu ứng mở (Bootstrap bỏ qua click khi đang chạy)
    await expect(nav).not.toHaveClass(/collapsing/);
    await page.locator('.navbar-toggler').click();
    await expect(nav).toBeHidden();
  });

  test('[G3] Nút giỏ ở header gọn, cùng hàng logo; badge hiện số món', async ({ page }) => {
    await page.goto('');
    const cart = page.locator('a.cart');
    const logo = page.locator('.navbar-brand');
    const badge = cart.locator('.js-cart-count');
    await expect(badge).toBeHidden();
    const cb = await cart.boundingBox();
    const lb = await logo.boundingBox();
    expect(cb.width, 'Nút giỏ không được kéo dài (bug thanh cart trên mobile)').toBeLessThan(120);
    expect(Math.abs((cb.y + cb.height / 2) - (lb.y + lb.height / 2)), 'Giỏ và logo cùng hàng').toBeLessThan(20);
    if (isCollapsedNav(page)) {
      const tb = await page.locator('.navbar-toggler').boundingBox();
      expect(cb.x + cb.width, 'Giỏ nằm bên trái nút ☰').toBeLessThanOrEqual(tb.x + 1);
    }
    await addFirstProduct(page);
    await expect(page.locator('a.cart .js-cart-count')).toHaveText('1');
  });

  test('[G4] Footer: địa chỉ mới, không còn "Tải Setup"', async ({ page }) => {
    await page.goto('');
    const footer = page.locator('footer');
    await expect(footer).toContainText('227 Nguyễn Văn Cừ, Phường Chợ Quán, TP. Hồ Chí Minh');
    await expect(footer).not.toContainText('Tải Setup');
    await expect(footer).not.toContainText('Quận 5');
  });

  test('[G5] Form liên hệ ở footer chặn khi để trống', async ({ page }) => {
    await page.goto('');
    const form = page.locator('footer form');
    await form.locator('button[type="submit"]').click();
    expect(await form.locator('#footer-email').evaluate((el) => el.validity.valid)).toBe(false);
  });

  test.fixme('[G5] Form liên hệ gửi về email của website', async () => {
    // Chờ triển khai: nhóm muốn form gửi về email của website (hiện formAction = "#").
  });

  test('[G6] Tiêu đề in hoa có dấu dùng font Oswald, không tràn dòng', async ({ page }) => {
    await page.goto('blog/chay-deadline-nhom/');
    const h = page.locator('.sk-display').first();
    await expect(h).toContainText('cuộc', { ignoreCase: true });
    expect(await h.evaluate((el) => getComputedStyle(el).textTransform)).toBe('uppercase');
    await page.evaluate(() => document.fonts.ready);
    expect(await h.evaluate((el) => getComputedStyle(el).fontFamily)).toContain('Oswald');
    expect(await page.evaluate(() => document.fonts.check('600 40px Oswald', 'ẠỘỐỔỖ'))).toBe(true);
  });

  test('[G7] Không còn icon bị thiếu glyph (ti-info-alt, ti-bolt)', async ({ page }) => {
    for (const path of ['build-your-own-kit/', 'schedule-rescue/', 'send-rescue/', 'cart-demo/']) {
      await page.goto(path);
      expect(await page.locator('i.ti-info-alt, i.ti-bolt').count(), path).toBe(0);
    }
  });

  test('[G8] Trang 404', async ({ page }) => {
    const res = await page.goto('khong-ton-tai-xyz/');
    expect(res?.status()).toBe(404);
    await expect(page.locator('a[href]').first()).toBeVisible();
  });

  test('[SEO] robots.txt và sitemap dùng URL tuyệt đối (QA-001)', async ({ page }) => {
    const robots = await page.request.get('robots.txt');
    expect(robots.status()).toBe(200);
    const text = await robots.text();
    expect(text).toContain('User-agent: *');
    expect(text).toMatch(/Sitemap: https:\/\/[^\s]+\/sitemap\.xml/);
    const sm = await (await page.request.get('sitemap.xml')).text();
    const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs.length).toBeGreaterThan(0);
    for (const l of locs) expect(l).toMatch(/^https:\/\//);
  });

  test('[SEO] Mỗi trang có title riêng, canonical và Open Graph (QA-002)', async ({ page }) => {
    const titles = new Map();
    for (const path of PAGES) {
      await page.goto(path);
      const t = await page.title();
      expect(titles.has(t), `Title trùng: "${t}" ở /${path} và /${titles.get(t)}`).toBe(false);
      titles.set(t, path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`^https://[^/]+/.*${path.replace(/\//g, '\\/')}$`));
      for (const p of ['og:title', 'og:description', 'og:image', 'og:url']) {
        await expect(page.locator(`meta[property="${p}"]`), `${p} ở /${path}`).toHaveAttribute('content', /\S/);
      }
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/.+\.(png|jpe?g|webp)$/);
    }
  });

  test('[A11y] Ảnh có alt (rỗng nếu trang trí), mỗi trang nội dung có đúng 1 h1 (QA-003, QA-004)', async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      expect(await page.locator('img:not([alt])').count(), `img thiếu alt ở /${path}`).toBe(0);
      await expect(page.locator('h1'), `h1 ở /${path}`).toHaveCount(1);
    }
  });

  test('[G*] Không có cuộn ngang ở mọi trang', async ({ page }) => {
    const wide = [];
    for (const path of PAGES) {
      await page.goto(path);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 2) wide.push(`/${path} tràn ${over}px`);
    }
    expect(wide).toEqual([]);
  });
});
