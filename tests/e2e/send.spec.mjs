// QA_PLAN mục 6: Send a Rescue (R1–R8)
import { test, expect, freshSession, isoDate } from './helpers.mjs';

const next = (page) => page.locator('.js-btn-next-step:visible').first();
const step = (page, n) => page.locator(`.js-rescue-step[data-step="${n}"]`);

async function pickType(page, type) {
  // Bấm vào thẻ (label) như người dùng thật, không ép tick radio ẩn.
  await page.locator(`label.js-gift-type-card[for="gift-type-${type}"]`).click();
  await expect(page.locator(`#gift-type-${type}`)).toBeChecked();
}

async function fillRecipient(page) {
  await page.locator('.js-input-recipient-name').fill('Minh Anh');
  await page.locator('.js-input-recipient-phone').fill('0987654321');
  await page.locator('.js-input-recipient-address').fill('123 Đường Mẫu, Phường Sài Gòn, TP. Hồ Chí Minh');
  await page.locator('.js-input-recipient-deadline').fill(isoDate(6));
  await page.locator('.js-input-delivery-date').fill(isoDate(5));
  const slot = page.locator('.js-input-slot').first();
  if ((await slot.getAttribute('type')) === 'radio') await slot.check({ force: true });
}

async function toStep(page, target, { type = 'bestie', anonymous = false } = {}) {
  await pickType(page, type);
  if (target === 1) return;
  await next(page).click();
  await expect(step(page, 2)).toBeVisible();
  if (target === 2) return;
  await next(page).click();
  await expect(step(page, 3)).toBeVisible();
  await fillRecipient(page);
  if (target === 3) return;
  await next(page).click();
  await expect(step(page, 4)).toBeVisible();
  if (anonymous) {
    await page.locator('.js-input-anonymous').check({ force: true });
    await page.locator('.js-input-private-phone').fill('0912345678');
  } else {
    await page.locator('.js-input-sender-name').fill('Bạn thân');
  }
  await page.locator('.js-input-message').fill('Cố lên, sắp xong rồi!');
  if (target === 4) return;
  await next(page).click();
  await expect(step(page, 5)).toBeVisible();
}

test.describe('R — Send a Rescue', () => {
  test.beforeEach(async ({ page }) => { await freshSession(page, 'send-rescue/'); });

  test('[R1] Nhận dữ liệu từ URL', async ({ page }) => {
    await page.goto('send-rescue/?type=love&recipient=Minh%20Anh&message=Co%20len');
    await expect(page.locator('.js-input-gift-type[value="love"]')).toBeChecked();
    await expect(page.locator('.js-input-recipient-name')).toHaveValue('Minh Anh');
    await expect(page.locator('.js-input-message')).toHaveValue('Co len');
  });

  test('[R2] Mỗi kiểu rescue cho kit gợi ý', async ({ page }) => {
    const kits = new Set();
    for (const t of ['bestie', 'love', 'crush', 'team']) {
      await freshSession(page, 'send-rescue/');
      await toStep(page, 2, { type: t });
      kits.add(await step(page, 2).innerText());
    }
    expect(kits.size, 'Kit gợi ý phải đổi theo kiểu rescue').toBeGreaterThan(1);
  });

  test('[R3] Bước 3: validate người nhận và ngày giao', async ({ page }) => {
    await toStep(page, 2);
    await next(page).click();
    await next(page).click();
    for (const e of ['.js-error-recipient-name', '.js-error-recipient-phone', '.js-error-recipient-address', '.js-error-delivery-date']) {
      await expect(page.locator(e), e).toBeVisible();
    }
    await fillRecipient(page);
    await page.locator('.js-input-recipient-deadline').fill(isoDate(6));
    await page.locator('.js-btn-quick-gift-date[data-offset="1"]').click();
    await expect(page.locator('.js-input-delivery-date')).toHaveValue(isoDate(5));
    await page.locator('.js-input-delivery-date').fill(isoDate(-1));
    await next(page).click();
    await expect(page.locator('.js-error-delivery-date')).toBeVisible();
  });

  test('[R4] Thiệp: preview cập nhật, HTML hiện dạng chữ', async ({ page }) => {
    await toStep(page, 4);
    await page.locator('.js-input-message').fill('<img src=x onerror=alert(1)> chúc thi tốt');
    await expect(page.locator('.js-card-preview-text')).toContainText('<img src=x');
    expect(await page.locator('.js-card-preview-box img[src="x"]').count()).toBe(0);
    await expect(page.locator('.js-card-preview-recipient')).toContainText('Minh Anh');
  });

  test('[R5] Ẩn danh chỉ có ở Crush Rescue', async ({ page }) => {
    await toStep(page, 4, { type: 'bestie' });
    await expect(page.locator('.js-anonymous-wrapper')).toBeHidden();
    await freshSession(page, 'send-rescue/');
    await toStep(page, 4, { type: 'crush', anonymous: true });
    await expect(page.locator('.js-anonymous-wrapper')).toBeVisible();
    await expect(page.locator('.js-card-preview-sender')).toContainText('ẩn danh');
  });

  test('[R6] Chặn xác nhận khi chưa tick cam kết', async ({ page }) => {
    await toStep(page, 5);
    await page.locator('.js-btn-confirm-send').click();
    await expect(page.locator('.js-rescue-success-view')).toBeHidden();
    await expect(page.locator('.js-error-agree-harassment')).toBeVisible();
  });

  test('[R7] Copy lời nhắn và gửi lại từ đầu', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'Quyền clipboard chỉ cấp được trên Chromium/Edge');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await toStep(page, 5);
    await page.locator('#rescue-agree-harassment').check({ force: true });
    await page.locator('#rescue-agree-terms').check({ force: true });
    await page.locator('.js-btn-confirm-send').click();
    await page.locator('.js-btn-copy-message').click();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Cố lên, sắp xong rồi!');
    await page.locator('.js-btn-reset-wizard').click();
    await expect(step(page, 1)).toBeVisible();
    await expect(page.locator('.js-input-recipient-name')).toHaveValue('');
  });

  test('[R8] Xác nhận: màn thành công và giỏ có quà tặng', async ({ page }) => {
    await toStep(page, 5);
    await page.locator('#rescue-agree-harassment').check({ force: true });
    await page.locator('#rescue-agree-terms').check({ force: true });
    await page.locator('.js-btn-confirm-send').click();
    await expect(page.locator('.js-rescue-success-view')).toBeVisible();
    await expect(page.locator('.js-rescue-success-view')).toContainText('Gửi Tiếp Sức Thành Công');
    await page.goto('cart-demo/');
    await expect(page.locator('.js-cart-gift-box')).toBeVisible();
  });
});
