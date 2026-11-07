// QA_PLAN mục 4: Build Your Own Kit (B1–B12)
import { test, expect, freshSession, addFirstProduct } from './helpers.mjs';

const card = (page, id) => page.locator(`.js-byok-card[data-id="${id}"]`);
const visibleNames = (page) => page.locator('.js-byok-card:visible').evaluateAll((els) => els.map((e) => e.dataset.name));

test.describe('B — Build Your Own Kit', () => {
  test.beforeEach(async ({ page }) => { await freshSession(page, 'build-your-own-kit/'); });

  test('[B1] Chọn level đổi câu mô tả và màu khung', async ({ page }) => {
    const msg = page.locator('[data-panic-level-message]').first();
    await page.locator('label[for="panic-radio-1"]').click();
    const m1 = await msg.textContent();
    await page.locator('label[for="panic-radio-7"]').click();
    await expect(page.locator('#panic-radio-7')).toBeChecked();
    await expect(msg).not.toHaveText(m1);
    await expect(page.locator('html')).toHaveAttribute('data-panic', '7');
  });

  test('[B2] Nhớ level chọn ở trang chủ', async ({ page }) => {
    await page.goto('');
    await page.locator('#panic-meter-range').fill('5');
    await page.goto('build-your-own-kit/');
    await expect(page.locator('#panic-radio-5')).toBeChecked();
    await page.goto('build-your-own-kit/?level=2');
    await expect(page.locator('#panic-radio-2')).toBeChecked();
  });

  test('[B3] "Áp dụng kit này": ảnh chip hiện, số lượng và tổng khớp', async ({ page }) => {
    const reco = page.locator('.js-reco-card');
    await expect(reco).toBeVisible();
    const chips = reco.locator('.js-reco-items img');
    await expect(chips.first()).toBeVisible();
    expect(await chips.evaluateAll((l) => l.filter((i) => i.complete && i.naturalWidth === 0).length), 'Ảnh chip vỡ').toBe(0);
    const recoTotal = (await page.locator('.js-reco-total').textContent()).match(/[\d.]+/)[0];
    await page.locator('.js-apply-reco').click();
    await expect(page.locator('.js-summary-total-price').first()).toContainText(recoTotal);
    expect(Number(await page.locator('.js-summary-items-count').first().textContent())).toBeGreaterThan(0);
  });

  test('[B4] Số lượng giới hạn 0–20', async ({ page }) => {
    const c = card(page, 'cafe-phin');
    const input = c.locator('.js-qty-input');
    await expect(c.locator('.js-qty-minus')).toBeDisabled();
    await c.locator('.js-qty-plus').click();
    await expect(input).toHaveValue('1');
    await expect(page.locator('.js-summary-total-price').first()).toContainText('25.000');
    await input.fill('50');
    await input.blur();
    await expect(input).toHaveValue('20');
    await input.fill('-3');
    await input.blur();
    await expect(input).toHaveValue('0');
  });

  test('[B5] Chọn mẫu ảnh đổi ảnh chính', async ({ page }) => {
    const choices = page.locator('.js-product-image-choice');
    test.skip((await choices.count()) < 2, 'Không có món nhiều mẫu');
    const parent = page.locator('.js-byok-card').filter({ has: page.locator('.js-product-image-choice >> nth=1') }).first();
    const img = parent.locator('.js-product-image');
    const before = await img.getAttribute('src');
    await parent.locator('.js-product-image-choice').nth(1).click();
    await expect(img).not.toHaveAttribute('src', before);
    await expect(parent.locator('.js-product-image-choice').nth(1)).toHaveAttribute('aria-pressed', 'true');
  });

  test('[B6] Lọc theo nhóm', async ({ page }) => {
    await page.locator('.js-filter-pill[data-filter-category="snacks"]').click();
    await expect(page.locator('.js-byok-card:visible')).toHaveCount(3);
    await expect(page.locator('.js-filter-status')).toHaveText('Đang hiển thị 3/15 món');
    await expect(page.locator('[data-category-group="drinks"]')).toBeHidden();
    await page.locator('.js-filter-pill[data-filter-category="all"]').click();
    await expect(page.locator('.js-byok-card:visible')).toHaveCount(15);
  });

  test('[B7] Tìm kiếm không dấu, debounce, trạng thái trống', async ({ page }) => {
    const search = page.locator('.js-filter-search');
    await search.pressSequentially('ca phe');
    expect(await visibleNames(page), 'Chưa lọc ngay (debounce 300ms)').toHaveLength(15);
    await expect.poll(() => visibleNames(page)).toEqual(['Cà phê túi lọc năng lượng']);
    await search.fill('STICKER');
    await expect.poll(() => visibleNames(page)).toContain('Bộ sticker meme động viên');
    await search.fill('xyzkhongco');
    await expect(page.locator('.js-filter-empty')).toBeVisible();
    await expect(page.locator('.js-filter-empty')).toContainText('Không tìm thấy món đồ phù hợp');
    await page.locator('.js-filter-reset').click();
    await expect(page.locator('.js-byok-card:visible')).toHaveCount(15);
  });

  test('[B8] Sắp xếp trong từng nhóm', async ({ page }) => {
    const drinks = () => page.locator('[data-category-group="drinks"] .js-byok-card').evaluateAll((els) => els.map((e) => ({ p: +e.dataset.price, pop: +e.dataset.popularity, n: e.dataset.name })));
    let d = await drinks();
    expect(d.map((x) => x.pop)).toEqual([...d.map((x) => x.pop)].sort((a, b) => b - a));
    await page.locator('.js-filter-sort').selectOption('price_asc');
    d = await drinks();
    expect(d.map((x) => x.p)).toEqual([...d.map((x) => x.p)].sort((a, b) => a - b));
    await page.locator('.js-filter-sort').selectOption('price_desc');
    d = await drinks();
    expect(d.map((x) => x.p)).toEqual([...d.map((x) => x.p)].sort((a, b) => b - a));
    await page.locator('.js-filter-sort').selectOption('name_asc');
    d = await drinks();
    expect(d.map((x) => x.n)).toEqual([...d.map((x) => x.n)].sort((a, b) => a.localeCompare(b, 'vi')));
  });

  test('[B9] Lọc không làm mất số lượng đã chọn', async ({ page }) => {
    const c = card(page, 'cafe-phin');
    await c.locator('.js-qty-plus').click();
    await c.locator('.js-qty-plus').click();
    await page.locator('.js-filter-pill[data-filter-category="study"]').click();
    await page.locator('.js-filter-search').fill('sticker');
    await page.waitForTimeout(400);
    await page.locator('.js-filter-sort').selectOption('price_desc');
    await page.locator('.js-filter-reset').click();
    await expect(c.locator('.js-qty-input')).toHaveValue('2');
    await expect(page.locator('.js-summary-total-price').first()).toContainText('50.000');
  });

  test('[B10] Lời nhắn tối đa 120 ký tự, không chạy HTML', async ({ page }) => {
    await card(page, 'cafe-phin').locator('.js-qty-plus').click();
    const box = page.locator('.js-kit-message-input');
    await box.fill('a'.repeat(130));
    expect((await box.inputValue()).length).toBeLessThanOrEqual(120);
    await box.fill('<b>xin chao</b>');
    await expect(page.locator('.js-preview-note')).toContainText('<b>xin chao</b>');
    expect(await page.locator('.js-preview-note b').count()).toBe(0);
  });

  test('[B11] Thêm vào giỏ giữ kit đã thêm trước đó', async ({ page }) => {
    const kitName = await addFirstProduct(page);
    await page.goto('build-your-own-kit/');
    await card(page, 'cafe-phin').locator('.js-qty-plus').click();
    await page.locator('.js-btn-add-to-cart:visible').first().click();
    await expect(page).toHaveURL(/cart-demo/);
    await expect(page.locator('.sk-cart-item')).toHaveCount(2);
    await expect(page.locator('.js-cart-items-list')).toContainText(kitName);
    await expect(page.locator('.js-cart-items-list')).toContainText('Cà phê túi lọc năng lượng');
  });

  test('[B12] Giá trên thẻ món dạng 25.000 ₫', async ({ page }) => {
    await expect(card(page, 'cafe-phin').locator('.sk-byok-price')).toHaveText('25.000 ₫');
  });
});
