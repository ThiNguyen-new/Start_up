// QA_PLAN mục 2: Trang chủ (H1–H11)
import { test, expect, freshSession, isoDate } from './helpers.mjs';

test.describe('H — Trang chủ', () => {
  test.beforeEach(async ({ page }) => { await freshSession(page, ''); });

  test('[H1] Nút "Browse Survival Kits" sang danh sách sản phẩm', async ({ page }) => {
    await page.locator('.sk-hero a.sk-btn').click();
    await expect(page).toHaveURL(/\/products\/$/);
  });

  test('[B1] Câu chuyện "Vì sao có Survival Kit?" ngay dưới hero, trước Panic Level', async ({ page }) => {
    const story = page.locator('#story');
    await expect(story.locator('h2')).toContainText('2 giờ sáng');
    await expect(story.locator('.sk-story-beat')).toHaveCount(3);
    await expect(story.locator('.sk-story-num')).toHaveText(['01', '02', '03']);
    const order = await page.evaluate(() => {
      const pos = (sel) => document.querySelector(sel).getBoundingClientRect().top + scrollY;
      return [pos('.sk-hero'), pos('#story'), pos('#panic')];
    });
    expect(order[0]).toBeLessThan(order[1]);
    expect(order[1]).toBeLessThan(order[2]);
    await expect(page.locator('h1')).toHaveCount(1); // story dùng h2/h3, không thêm h1
  });

  test('[B2] Ba thẻ "vấn đề → cách giải" dẫn đúng trang, hiện ra khi cuộn tới', async ({ page }) => {
    const cards = page.locator('#story .sk-story-path');
    await expect(cards).toHaveCount(3);
    const expected = [['schedule-rescue/'], ['products/', 'build-your-own-kit/'], ['send-rescue/']];
    for (let i = 0; i < 3; i++) {
      const hrefs = await cards.nth(i).locator('a.sk-story-link').evaluateAll((as) => as.map((a) => new URL(a.href).pathname));
      expect(hrefs.map((h) => h.replace(/^.*?\/(?=[^/]+\/$)/, ''))).toEqual(expected[i]);
      await cards.nth(i).evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await expect.poll(() => cards.nth(i).evaluate((e) => Number(getComputedStyle(e).opacity))).toBeGreaterThan(0.95);
    }
    await cards.nth(2).locator('a.sk-story-link').click();
    await expect(page).toHaveURL(/send-rescue\/$/);
  });

  test('[C3] Trang chủ: 3 lối "phối sẵn / cho mình / cho người khác", trước Featured', async ({ page }) => {
    const paths = page.locator('.sk-paths--home .sk-path');
    await expect(paths).toHaveCount(3);
    await expect(paths.locator('.sk-path-who')).toHaveText(['Cần nhanh', 'Cho mình', 'Cho người khác']);
    const hrefs = await paths.locator('a').evaluateAll((as) => as.map((a) => new URL(a.href).pathname.split('/').filter(Boolean).pop()));
    expect(hrefs).toEqual(['products', 'build-your-own-kit', 'send-rescue']);
    await expect(page.locator('.sk-path.is-here')).toHaveCount(0);
    const [p, f] = await Promise.all(['.sk-paths-section', '#featured-kits'].map((s) => page.locator(s).evaluate((e) => e.getBoundingClientRect().top)));
    expect(p).toBeLessThan(f);
  });

  test('[C4] Menu: chú thích tiếng Việt cho Build/Send (title + dòng nhỏ ở mobile), tên giữ nguyên', async ({ page }) => {
    const build = page.locator('#navigation a.nav-link', { hasText: 'Build Your Own Kit' });
    await expect(build).toHaveAttribute('title', 'Tự phối kit cho chính mình');
    await expect(page.locator('#navigation a.nav-link', { hasText: 'Send a Rescue' })).toHaveAttribute('title', 'Gửi kit tiếp sức cho người khác');
    const hints = page.locator('#navigation .sk-nav-hint');
    await expect(hints).toHaveCount(2);
    if ((page.viewportSize()?.width || 1440) < 992) {
      await page.locator('.navbar-toggler').click();
      await expect(hints.first()).toBeVisible();
    } else {
      await expect(hints.first()).toBeHidden();
    }
  });

  test('[H2] Slider Panic Level 1→7 cập nhật tiêu đề, badge, aria', async ({ page }) => {
    const slider = page.locator('#panic-meter-range');
    for (let n = 1; n <= 7; n++) {
      await slider.fill(String(n));
      await expect(page.locator('[data-panic-level-text]').first()).toHaveText(`Level ${n}`);
      await expect(page.locator('.js-panic-meter-badge-num')).toHaveText(String(n));
      await expect(slider).toHaveAttribute('aria-valuenow', String(n));
      await expect(page.locator('html')).toHaveAttribute('data-panic', String(n));
    }
  });

  test('[H2] Slider dùng được bằng bàn phím', async ({ page }) => {
    const slider = page.locator('#panic-meter-range');
    await slider.fill('3');
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await expect(slider).toHaveAttribute('aria-valuenow', '4');
  });

  test('[H3] Nút mode 1–7: nhảy slider, nút active, chữ không tràn', async ({ page }) => {
    const steps = page.locator('.js-panic-step');
    await expect(steps).toHaveCount(7);
    for (let n = 1; n <= 7; n++) {
      await steps.nth(n - 1).click();
      await expect(page.locator('#panic-meter-range')).toHaveValue(String(n));
      await expect(steps.nth(n - 1)).toHaveClass(/is-active/);
      await expect(steps.nth(n - 1)).toHaveAttribute('aria-pressed', 'true');
    }
    const overflow = await steps.evaluateAll((els) => els.filter((e) => e.scrollWidth > e.clientWidth + 1).map((e) => e.textContent.trim()));
    // Tên dài được rút gọn bằng "…" (text-overflow), nhưng nút không được bị đẩy tràn.
    const btnOverflow = await steps.evaluateAll((els) => els.filter((e) => e.getBoundingClientRect().right > e.parentElement.getBoundingClientRect().right + 1).length);
    expect(btnOverflow, `Nút tràn khỏi hàng: ${overflow.join(', ')}`).toBe(0);
  });

  test('[H4] Khung slider đổi màu nền theo level', async ({ page }) => {
    const card = page.locator('.sk-panic-tint').first();
    await page.locator('#panic-meter-range').fill('1');
    await page.waitForTimeout(500);
    const c1 = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.locator('#panic-meter-range').fill('7');
    await page.waitForTimeout(500);
    const c7 = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(c1).not.toBe(c7);
  });

  test('[H5] Đổi loại kit đổi nội dung "Kit gợi ý", ảnh chip không vỡ', async ({ page }) => {
    const title = page.locator('.js-panic-kit-title');
    const seen = new Set();
    for (const cat of ['exam', 'project', 'club', 'care']) {
      await page.locator(`#panic .js-kit-cat-btn[data-category="${cat}"]`).click();
      await expect(title).not.toBeEmpty();
      seen.add(await title.textContent());
      const chips = page.locator('.js-panic-kit-items img');
      await expect(chips.first()).toBeVisible();
      const broken = await chips.evaluateAll((imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
      expect(broken, `Ảnh chip vỡ (${cat})`).toEqual([]);
    }
    expect(seen.size, 'Mỗi loại kit cho nội dung khác nhau').toBeGreaterThan(1);
  });

  test('[H6] "Xây kit này" sang Build với đúng level', async ({ page }) => {
    await page.locator('#panic-meter-range').fill('6');
    await page.locator('.js-panic-explore-btn').click();
    await expect(page).toHaveURL(/build-your-own-kit/);
    await expect(page.locator('#panic-radio-6')).toBeChecked();
  });

  test('[H7] Featured: 3 kit bán chạy đúng thứ tự, giá VND', async ({ page }) => {
    const cards = page.locator('#featured-kits .sk-product-card');
    await expect(cards).toHaveCount(3);
    await expect(cards.locator('h3')).toHaveText(['Mini Rescue Kit', 'Exam Survival Kit', 'Club Survival Kit']);
    await expect(cards.locator('.sk-bestseller')).toHaveText(['Bán chạy #1', 'Bán chạy #2', 'Bán chạy #3']);
    await expect(cards.first().locator('.sk-product-price')).toContainText('49.000₫');
  });

  test('[H8] Form "Lên lịch" chuyển sang Schedule Rescue kèm ngày', async ({ page }) => {
    const d = isoDate(5), r = isoDate(4);
    await page.locator('#deadline').fill(d);
    await page.locator('#receive').fill(r);
    await page.locator('#schedule button[type="submit"]').click();
    await expect(page).toHaveURL(new RegExp(`schedule-rescue/\\?deadline=${d}&receive=${r}`));
    await expect(page.locator('.js-input-deadline-date')).toHaveValue(d);
    await expect(page.locator('.js-input-receive-date')).toHaveValue(r);
  });

  test('[H9] Form "Gửi tặng" chuyển sang Send Rescue kèm dữ liệu', async ({ page }) => {
    await page.locator('#recipient').fill('Minh Anh');
    await page.locator('#gift-type').selectOption('love');
    await page.locator('#gift-message').fill('Cố lên nhé!');
    await page.locator('#gifting button[type="submit"]').click();
    await expect(page).toHaveURL(/send-rescue\/\?recipient=Minh/);
    await expect(page.locator('.js-input-gift-type[value="love"]')).toBeChecked();
  });

  test('[H8b] Tiêu đề "Lên lịch"/"Gửi tặng" không bị trang trí đè trên mobile (QA web-error, đề xuất 3)', async ({ page }) => {
    for (const id of ['schedule', 'gifting']) {
      const h = page.locator(`#${id}-heading`);
      await h.scrollIntoViewIfNeeded();
      const hb = await h.boundingBox();
      const decos = await page.locator(`#${id} .sk-usp-deco, #${id} .sk-usp-dot`).evaluateAll((els) => els
        .filter((e) => getComputedStyle(e).display !== 'none')
        .map((e) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y + window.scrollY, w: r.width, h: r.height, c: e.getAttribute('class') }; }));
      const top = hb.y + (await page.evaluate(() => window.scrollY));
      const hit = decos.filter((d) => d.x < hb.x + hb.width && d.x + d.w > hb.x && d.y < top + hb.height && d.y + d.h > top);
      expect(hit.map((d) => d.c), `Trang trí đè tiêu đề #${id}`).toEqual([]);
    }
  });

  test('[H10] Testimonial slider chuyển được', async ({ page }) => {
    const slider = page.locator('.testimonial-slider');
    await slider.scrollIntoViewIfNeeded();
    const before = await slider.locator('.slick-current').getAttribute('data-slick-index');
    await slider.locator('.nextArrow').click();
    await expect.poll(() => slider.locator('.slick-current').getAttribute('data-slick-index')).not.toBe(before);
  });

  test('[H11] CTA "Get a Survival Kit" đọc được và dẫn tới sản phẩm', async ({ page }) => {
    const btn = page.locator('.sk-cta .sk-btn');
    const [fg, bg] = await btn.evaluate((el) => [getComputedStyle(el).color, getComputedStyle(el).backgroundColor]);
    expect(fg).not.toBe(bg);
    expect(bg, 'Nền nút không được trong suốt trên gradient tối').not.toBe('rgba(0, 0, 0, 0)');
    await btn.click();
    await expect(page).toHaveURL(/\/products\/$/);
  });
});
