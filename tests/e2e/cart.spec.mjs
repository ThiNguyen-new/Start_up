// QA_PLAN mục 3: Sản phẩm và giỏ hàng (P1–P16)
import { test, expect, freshSession, addFirstProduct } from './helpers.mjs';

async function goCheckout(page) {
  await page.goto('cart-demo/');
  await page.locator('.js-go-checkout').click();
  await expect(page.locator('.js-checkout-view')).toBeVisible();
}

async function fillAndPay(page, wallet = 'momo') {
  await page.locator('.js-fill-sample').click();
  await page.locator(`input[name="payment"][value="${wallet}"]`).check();
  await page.locator('.js-checkout-view button[type="submit"]').click();
  await expect(page.locator('.js-pay-view')).toBeVisible();
}

test.describe('P — Sản phẩm và giỏ hàng', () => {
  test.beforeEach(async ({ page }) => { await freshSession(page, 'products/'); });

  test('[P1] Danh sách 7 kit, giá VND', async ({ page }) => {
    const cards = page.locator('.sk-product-card');
    await expect(cards).toHaveCount(7);
    const prices = await cards.locator('.sk-product-price .lead').allTextContents();
    for (const p of prices) expect(p.trim()).toMatch(/^\d{1,3}(\.\d{3})+₫$/);
  });

  test('[P2] Trang chi tiết: ảnh chính và ảnh nhỏ không vỡ, tab chuyển được', async ({ page }) => {
    await page.goto('products/club-survival-kit/');
    const imgs = page.locator('.product-slider img, .slick-dots img');
    await expect(imgs.first()).toBeVisible();
    const broken = await imgs.evaluateAll((list) => list.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src));
    expect(broken).toEqual([]);
    await page.locator('#reviews-tab').click();
    await expect(page.locator('#reviews-tab')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#reviews')).toHaveClass(/active/);
  });

  test('[P3] Add to cart ở danh sách, trang chi tiết và trang chủ; không tải Snipcart', async ({ page }) => {
    const snipcart = [];
    page.on('request', (r) => { if (/snipcart/i.test(r.url())) snipcart.push(r.url()); });
    const name = await addFirstProduct(page);
    const toast = page.locator('.sk-cart-toast');
    await expect(toast).toContainText(`Đã thêm “${name}” vào giỏ`);
    await expect(toast.getByRole('link', { name: 'Xem giỏ hàng' })).toBeVisible();
    await page.goto('products/club-survival-kit/');
    await page.locator('.snipcart-add-item, .js-add-to-cart').first().click();
    await page.goto('');
    await page.locator('#featured-kits .js-add-to-cart').first().click();
    await expect(page.locator('a.cart .js-cart-count')).toHaveText('3');
    expect(snipcart, 'Không được gọi Snipcart').toEqual([]);
  });

  test('[P4] Thêm trùng sản phẩm gộp thành 1 dòng', async ({ page }) => {
    const btn = page.locator('.js-add-to-cart').first();
    await btn.click(); await btn.click();
    await page.goto('cart-demo/');
    await expect(page.locator('.sk-cart-item')).toHaveCount(1);
    await expect(page.locator('.sk-qty span')).toHaveText('2');
  });

  test('[P5] +/−, Xóa và Xóa giỏ', async ({ page }) => {
    await page.locator('.js-add-to-cart').nth(0).click();
    await page.locator('.js-add-to-cart').nth(1).click();
    await page.goto('cart-demo/');
    const first = page.locator('.sk-cart-item').first();
    await expect(first.locator('.sk-qty button').first(), '− bị khóa ở 1').toBeDisabled();
    const before = await page.locator('.js-cart-total-price').textContent();
    await first.locator('.sk-qty button').last().click();
    await expect(first.locator('.sk-qty span')).toHaveText('2');
    await expect(page.locator('.js-cart-total-price')).not.toHaveText(before);
    await first.getByRole('button', { name: /^Xóa/ }).click();
    await expect(page.locator('.sk-cart-item')).toHaveCount(1);
    page.once('dialog', (d) => d.accept());
    await page.locator('.js-btn-clear-cart').click();
    await expect(page.locator('.js-cart-empty-view')).toBeVisible();
    await expect(page.locator('.js-cart-empty-view')).toContainText('Giỏ hàng đang trống');
  });

  test('[P6] Ảnh trong giỏ hiện và vuông', async ({ page }) => {
    await addFirstProduct(page);
    await page.goto('cart-demo/');
    const img = page.locator('.sk-cart-thumb img').first();
    await expect(img).toBeVisible();
    const [w, h, nw] = await img.evaluate((i) => [i.clientWidth, i.clientHeight, i.naturalWidth]);
    expect(nw).toBeGreaterThan(0);
    expect(Math.abs(w - h)).toBeLessThan(2);
  });

  test('[P7] Giỏ giữ qua các trang', async ({ page }) => {
    await addFirstProduct(page);
    await page.goto('faq/');
    await page.goto('blog/');
    await page.goto('cart-demo/');
    await expect(page.locator('.sk-cart-item')).toHaveCount(1);
  });

  test('[P8] Validate thông tin giao hàng', async ({ page }) => {
    await addFirstProduct(page);
    await goCheckout(page);
    await page.locator('.js-checkout-view button[type="submit"]').click();
    const errors = page.locator('.sk-field-error:not(:empty)');
    await expect(errors).toHaveCount(6);
    await expect(page.locator('#co-name')).toBeFocused();
    await page.locator('#co-phone').fill('12345');
    await page.locator('#co-email').fill('khong-phai-email');
    await page.locator('.js-checkout-view button[type="submit"]').click();
    await expect(page.locator('.sk-field-error[data-for="phone"]')).toContainText('Số điện thoại chưa đúng');
    await expect(page.locator('.sk-field-error[data-for="email"]')).toContainText('Email chưa đúng');
  });

  test('[P9] "Điền dữ liệu mẫu" điền đủ và xóa lỗi', async ({ page }) => {
    await addFirstProduct(page);
    await goCheckout(page);
    await page.locator('.js-checkout-view button[type="submit"]').click();
    await page.locator('.js-fill-sample').click();
    for (const id of ['#co-name', '#co-phone', '#co-province', '#co-ward', '#co-address']) {
      await expect(page.locator(id)).not.toHaveValue('');
    }
    await expect(page.locator('.sk-field-error[data-for="name"]')).toBeEmpty();
  });

  test('[P10] 34 tỉnh/thành', async ({ page }) => {
    await addFirstProduct(page);
    await goCheckout(page);
    await expect(page.locator('#co-province option:not([value=""])')).toHaveCount(34);
  });

  test('[P11] Phí giao hàng: dưới / trên 150.000₫ và hỏa tốc', async ({ page }) => {
    await addFirstProduct(page); // Burnout Care 99.000₫
    await goCheckout(page);
    await expect(page.locator('.js-co-shipping')).toHaveText('20.000₫');
    await page.locator('input[name="shipping"][value="express"]').check();
    await expect(page.locator('.js-co-shipping')).toHaveText('35.000₫');
    await page.locator('.js-back-cart').click();
    await page.locator('.sk-qty button').last().click(); // 198.000₫
    await page.locator('.js-go-checkout').click();
    await page.locator('input[name="shipping"][value="standard"]').check();
    await expect(page.locator('.js-co-shipping')).toHaveText('Miễn phí');
  });

  test('[P12] Mã giảm giá', async ({ page }) => {
    await addFirstProduct(page);
    await goCheckout(page);
    const code = page.locator('#co-voucher');
    const apply = page.locator('.js-apply-voucher');
    const msg = page.locator('.js-voucher-msg');
    await apply.click();
    await expect(msg).toHaveText('Bạn chưa nhập mã.');
    await code.fill('SAI');
    await apply.click();
    await expect(msg).toHaveText('Mã không hợp lệ.');
    await code.fill('deadline10');
    await apply.click();
    await expect(page.locator('.js-co-discount')).toHaveText('-9.900₫');
    await code.fill('FREESHIP');
    await apply.click();
    await expect(page.locator('.js-co-shipping')).toHaveText('Miễn phí');
  });

  for (const wallet of ['momo', 'zalopay']) {
    test(`[P13] Màn thanh toán ${wallet} mô phỏng, không hỏi mật khẩu/OTP`, async ({ page }) => {
      await addFirstProduct(page);
      await goCheckout(page);
      await fillAndPay(page, wallet);
      const card = page.locator('.sk-pay-card');
      await expect(card).toHaveAttribute('data-wallet', wallet);
      await expect(card).toContainText('MÔ PHỎNG');
      await expect(page.locator('.sk-pay-qr-stamp')).toHaveText('DEMO');
      await expect(page.locator('.js-pay-timer')).toHaveText(/0[45]:\d\d/);
      expect(await page.locator('.js-pay-view input').count(), 'Không có ô nhập (mật khẩu/OTP)').toBe(0);
    });
  }

  test('[P14] Mã hết hạn và tạo mã mới', async ({ page }) => {
    await page.clock.install();
    await addFirstProduct(page);
    await goCheckout(page);
    await fillAndPay(page);
    const code = await page.locator('.js-pay-order').textContent();
    await page.clock.runFor(301_000);
    await expect(page.locator('.js-pay-expired')).toBeVisible();
    await expect(page.locator('.js-pay-success')).toBeDisabled();
    await page.locator('.js-pay-renew').click();
    await expect(page.locator('.js-pay-success')).toBeEnabled();
    await expect(page.locator('.js-pay-order')).not.toHaveText(code);
  });

  test('[P15] Hủy thanh toán giữ dữ liệu form', async ({ page }) => {
    await addFirstProduct(page);
    await goCheckout(page);
    await fillAndPay(page);
    await page.locator('.js-pay-cancel').click();
    await expect(page.locator('.js-checkout-view')).toBeVisible();
    await expect(page.locator('#co-name')).toHaveValue('Nguyễn Văn Demo');
  });

  test('[P16] Hoàn tất: mã đơn, form bị xóa, không lưu và không gửi dữ liệu', async ({ page }) => {
    const sent = [];
    page.on('request', (r) => { if (r.method() !== 'GET') sent.push(`${r.method()} ${r.url()}`); });
    await addFirstProduct(page);
    await goCheckout(page);
    await fillAndPay(page, 'zalopay');
    await page.locator('.js-pay-success').click();
    await expect(page.locator('.js-done-view')).toBeVisible();
    await expect(page.locator('.js-done-order')).toHaveText(/^SK\d{6}-[A-Z0-9]{4}$/);
    await expect(page.locator('.js-done-method')).toContainText('ZaloPay');
    await expect(page.locator('#co-name')).toHaveValue('');
    expect(await page.evaluate(() => sessionStorage.length + localStorage.length)).toBe(0);
    expect(sent, 'Không được gửi dữ liệu form đi đâu').toEqual([]);
    await expect(page.locator('a.cart .js-cart-count')).toBeHidden();
  });
});
