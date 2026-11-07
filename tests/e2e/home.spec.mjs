// QA_PLAN mục 2: Trang chủ (H1–H11)
import { test, expect, freshSession, isoDate } from './helpers.mjs';

test.describe('H — Trang chủ', () => {
  test.beforeEach(async ({ page }) => { await freshSession(page, ''); });

  test('[H1] Nút "Browse Survival Kits" sang danh sách sản phẩm', async ({ page }) => {
    await page.locator('.sk-hero a.sk-btn').click();
    await expect(page).toHaveURL(/\/products\/$/);
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
